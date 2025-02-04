If you're tasked with a real time stock market dashboard using React, which has:

1. High frequency udpates (~ 100 updates/sec)
2. Components like charts, tables and notifications that must respond to updates
3. Needs to be highly performant, with minimal re-renders


- How would you manage state for real-time updates?
- How would you prevent unnecessary re-renders across components?
- What libraries or tools would you use for real-time updates? Why?


Ans: If you've thought about using Web Sockets, you're on the right track!.

## How do you manage state? Redux or local state? When to conider one over the other?

Using web sockets for the real time updates and redux makes sense for most of the scenarios.
But there are some considerations to refine:

1. Redux and high frequency updates

Redux works well for managing global state, but *frequent updates* (e.g., 100 updates/sec) can cause performace issues because:

- Every dispatch requires a new state tree creation.
- Every connected component re-checks state for changes. 

## How to Improve Redux for Real-Time Updates?

- Use Local State for High-Frequency Data:

  Instead of storing all updates in Redux, store high-frequency updates (e.g., stock price changes) in local state (e.g., useState) for the relevant component.
  Use Redux for aggregated/important updates, like notifications or user settings.

- Batch Updates:

  Batch multiple updates from the WebSocket before dispatching them to Redux to reduce re-renders.
  Example: Accumulate stock price updates over 100ms and dispatch them as a single action.

## How to prevent unnecessary Re-renders?

If you listen to the redux changes directly, it is bound to cause re-renders if not optimized. You can follow different techniques

1. Selector optimization using `reselect`

  Use reselect to compute derived data and only trigger updates for specific parts of the state.

```js
  import { createSelector } from "reselect";

  const selectStockPrices = (state) => state.stocks;
  const selectSpecificStock = createSelector(
    [selectStockPrices],
    (stocks) => stocks["AAPL"] // Only updates when "AAPL" changes
  );

```

2. React.memo + Context API

For components like tables or charts, memoize them using React.memo and pass only the specific data they need.

3. Websocket + Real-time update libraries

Instead of manually handling WebSocket connections and dispatching actions, consider real-time libraries for a more scalable solution:

- react-query + WebSocket Integration:
- Dedicated Libraries:
    1. RxJS: If you need more control over high-frequency data streams, RxJS Observables can efficiently handle WebSocket streams.
    2. socket.io-client: Easy-to-use WebSocket library that works well for real-time apps


### State management

```js
const StockChart = ({ stockId }) => {
  const [data, setData] = useState([]);

  useWebSocket("wss://stocks.example.com", (message) => {
    if (message.stockId === stockId) {
      setData((prevData) => [...prevData, message.price]);
    }
  });

  return <Chart data={data} />;
};

```

- When to Use Redux

Use Redux for:
  - Global state: E.g., user preferences, notifications, or aggregated
  stock data.
  - Rarely-changing data: E.g., stock metadata (names, IDs).

### Batching in Redux
Avoid dispatching for each WebSocket message by grouping updates:

```js
    const batchStockUpdates = (updates) => ({
      type: "BATCH_STOCK_UPDATES",
      payload: updates,
    });
```

In your reducer:

```js
    const stockReducer = (state = {}, action) => {
      switch (action.type) {
        case "BATCH_STOCK_UPDATES":
          return {
            ...state,
            ...action.payload.reduce(
              (acc, stock) => ({ ...acc, [stock.id]: stock.price }),
              {}
            ),
          };
        default:
          return state;
      }
    };
```

###  Preventing Unnecessary Re-Renders

__Using React.memo__

  For high-frequency updates, wrap components in React.memo so they only re-render when their props change.

  ```js
    const StockRow = React.memo(({ stock }) => {
      return (
        <div>
          {stock.name}: {stock.price}
        </div>
      );
    });
  ```

__Selector Optimization with Reselect__

Selectors ensure components only re-render when the relevant part of the state changes:

```js
  import { createSelector } from "reselect";

  const selectStockPrices = (state) => state.stocks;
  const selectSpecificStock = (stockId) =>
    createSelector([selectStockPrices], (stocks) => stocks[stockId]);

  const StockRowContainer = ({ stockId }) => {
    const stock = useSelector(selectSpecificStock(stockId));
    return <StockRow stock={stock} />;
  };
```

### Virtualized Rendering for Large Lists

For components like stock tables, use virtualization to render only the visible rows.

Example: Use React-Window:

```js
    import { FixedSizeList as List } from "react-window";

    const StockTable = ({ stocks }) => (
      <List
        height={400}
        itemCount={stocks.length}
        itemSize={35}
        width={"100%"}
      >
        {({ index, style }) => (
          <div style={style}>
            {stocks[index].name}: {stocks[index].price}
          </div>
        )}
      </List>
    );
```

### Full architecture example:

Here’s a practical example combining WebSockets, Redux, and rendering optimizations:

#### WebSocket + Redux Integration

```js

// Redux Action
const batchStockUpdates = (updates) => ({
  type: "BATCH_STOCK_UPDATES",
  payload: updates,
});

// WebSocket Hook
const useStockUpdates = (dispatch) => {
  useBatchedWebSocket(
    "wss://stocks.example.com",
    (batch) => dispatch(batchStockUpdates(batch)),
    100 // Batch every 100ms
  );
};

// App Component
const App = () => {
  const dispatch = useDispatch();
  useStockUpdates(dispatch);

  return <StockTableContainer />;
};

// Stock Table with Virtualization
const StockTableContainer = () => {
  const stocks = useSelector((state) => Object.values(state.stocks));
  return <StockTable stocks={stocks} />;
};

```