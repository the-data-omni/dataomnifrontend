import { render, waitFor } from "@testing-library/react";
import Visualizer from ".";

const wrapperStyle = { width: 1200, height: 800 };

test("renders nodes and edges", async () => {
  const { container } = render(
    <div style={wrapperStyle}>
      <Visualizer database={"bindle"} />
    </div>
  );


  await waitFor(() => {
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const nodes = container.getElementsByClassName("react-flow__node");
    expect(nodes.length).toBe(14);
  });

  await waitFor(() => {
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const edges = container.getElementsByClassName("react-flow__edge");
    expect(edges.length).toBe(12);
  });
});
