import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import React, { Suspense } from "react";

import { gql } from "@apollo/client";
import { useMutation, useSuspenseQuery } from "@apollo/client/react";
import { MockedProvider } from "@apollo/client/testing/react";

jest.setTimeout(30000);

const ITEMS_QUERY = gql`
  query GetItems {
    items
  }
`;

const ADD_ITEM_MUTATION = gql`
  mutation AddItem {
    addItem
  }
`;

function Items() {
  const { data } = useSuspenseQuery(ITEMS_QUERY);
  return (
    <ul>
      {data.items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function App() {
  const [addItem] = useMutation(ADD_ITEM_MUTATION, {
    refetchQueries: [ITEMS_QUERY],
  });
  return (
    <>
      <button onClick={() => addItem()}>Add</button>
      <Suspense fallback={<p>Loading...</p>}>
        <Items />
      </Suspense>
    </>
  );
}

test("mutation refetchQueries reliably updates a sibling useSuspenseQuery", async () => {
  const mocks = [
    {
      request: { query: ITEMS_QUERY },
      result: { data: { items: ["a", "b"] } },
    },
    {
      request: { query: ADD_ITEM_MUTATION },
      result: { data: { addItem: true } },
    },
    {
      request: { query: ITEMS_QUERY },
      result: { data: { items: ["a", "b", "c"] } },
    },
  ];

  await act(() =>
    render(
      <MockedProvider mocks={mocks}>
        <App />
      </MockedProvider>
    )
  );

  fireEvent.click(screen.getByText("Add"));

  await waitFor(
    () => {
      expect(screen.getByText("c")).toBeInTheDocument();
    },
    { timeout: 5000 }
  );
});
