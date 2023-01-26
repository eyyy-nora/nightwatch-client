import React, { useEffect, useState } from "react";
import { useShelters } from "src/renderer/api-client";
import { Icon } from "src/renderer/component/typography/icon";

export function App() {
  const [count, setCount] = useState(0);
  const { data: shelters, busy } = useShelters();

  useEffect(() => {
    const timer = setInterval(() => {
      setCount(c => c + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-rose-200">
      <h1>Count {count}</h1>
      <Icon icon="gear" />
      <div>Hello world!</div>
      <div className="container">Fast refresh active</div>
      {busy ? (
        <div>Loading...</div>
      ) : (
        <pre>
          <code>{JSON.stringify(shelters, null, 2)}</code>
        </pre>
      )}
    </div>
  );
}
