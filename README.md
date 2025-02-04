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

If you listen to the redux changes directly, it is bound to cause re-renders if not optimized.

1. Selector optimization using `reselect`
2. React.memo + Context API
3. Websocket + Real-time update libraries
