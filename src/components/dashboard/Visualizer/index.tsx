"use client";
import { useCallback, useEffect, useState } from "react";
import ReactFlow, {
  Node,
  useNodesState,
  useEdgesState,
  Controls,
  ControlButton,
  Background,
  useStoreApi,
  ReactFlowProvider,
  getConnectedEdges,
  OnSelectionChangeParams,
  NodeChange,
  getIncomers,
  getOutgoers,
  ReactFlowInstance,
} from "reactflow";

import { nodeTypes } from "./config/nodeTypes";

import {
  MaximizeIcon,
  MinimizeIcon,
  InfoIcon,
  InfoPopup,
  Markers,
} from "./components";

import {
  edgeClassName,
  edgeMarkerName,
  calculateTargetPosition,
  calculateSourcePosition,
  initializeNodes,
  moveSVGInFront,
  setHighlightEdgeClassName,
  logTablePositions,
  setEdgeClassName,
  loadDatabases,
  calculateEdges,
} from "./helpers";

import { EdgeConfig, DatabaseConfig } from "./types";

// IMPORTANT: Import the required CSS so React Flow displays properly.
import "reactflow/dist/style.css";
import "./Style";
import DatabaseIcon from "./components/DatabaseIcon";
import { DatabaseMenuPopup } from "./components/DatabaseMenuPopup";

interface FlowProps {
  currentDatabase: DatabaseConfig;
}

interface VisualizerProps {
  database?: string;
}

const Flow: React.FC<FlowProps> = (props: FlowProps) => {
  const currentDatabase = props.currentDatabase;
  const initialNodes = initializeNodes(currentDatabase);

  const store = useStoreApi();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [fullscreenOn, setFullScreen] = useState(false);
  const [infoPopupOn, setInfoPopupOn] = useState(false);
  const [unknownDatasetOn, setUnknownDatasetOn] = useState(false);
  const [databaseMenuPopupOn, setDatabaseMenuPopupOn] = useState(false);
  const [nodeHoverActive, setNodeHoverActive] = useState(true);

  const onInit = (instance: ReactFlowInstance) => {
    const nodes = instance.getNodes();
    const initialEdges = calculateEdges({ nodes, currentDatabase });
    setEdges(() => initialEdges);

    const handleKeyboard = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "p") {
        const nodes = instance.getNodes();
        logTablePositions(nodes);
      }
    };

    document.addEventListener("keydown", handleKeyboard);

    // Detect fullscreen via window resize
    window.addEventListener("resize", () => {
      setFullScreen(window.innerHeight === window.screen.height);
    });

    document.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.code === "Escape") {
        setInfoPopupOn(false);
        setUnknownDatasetOn(false);
        setDatabaseMenuPopupOn(false);
      }
    });

    // Close popup if clicking outside
    document.addEventListener("click", (event: Event) => {
      const popup = document.querySelector(".info-popup");
      if (!popup) return;

      const target = event.target as HTMLInputElement;
      if (target && target.closest(".into-popup-toggle")) return;
      if (target && !target.closest(".info-popup__inner")) {
        setInfoPopupOn(false);
        setUnknownDatasetOn(false);
        setDatabaseMenuPopupOn(false);
      }
    });

    // Toggle hover state on Meta key down/up
    document.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.code === "MetaLeft") {
        setNodeHoverActive(false);
      }
    });
    document.addEventListener("keyup", (e: KeyboardEvent) => {
      if (e.code === "MetaLeft") {
        setNodeHoverActive(true);
      }
    });
  };

  // Highlight connected edges on node hover
  const onNodeMouseEnter = useCallback(
    (_: any, node: Node) => {
      if (!nodeHoverActive) return;

      const state = store.getState();
      state.resetSelectedElements();
      state.addSelectedNodes([node.id]);

      const connectedEdges = getConnectedEdges([node], edges);
      setEdges((eds) =>
        eds.map((ed) => {
          if (connectedEdges.find((e) => e.id === ed.id)) {
            setHighlightEdgeClassName(ed);
          }
          return ed;
        })
      );
    },
    [edges, nodeHoverActive, setEdges, store]
  );

  const onNodeMouseLeave = useCallback(
    (_: any, node: Node) => {
      if (!nodeHoverActive) return;

      const state = store.getState();
      state.resetSelectedElements();

      setEdges((eds) => eds.map((ed) => setEdgeClassName(ed)));

      // Clear focus
      (document.activeElement as HTMLElement).blur();
    },
    [nodeHoverActive, setEdges, store]
  );

  const onSelectionChange = useCallback((params: OnSelectionChangeParams) => {
    params.edges.forEach((ed) => {
      const svg = document
        .querySelector(".react-flow__edges")
        ?.querySelector(`[data-testid="rf__edge-${ed.id}"]`);
      moveSVGInFront(svg);
    });
  }, []);

  const handleNodesChange = useCallback(
    (nodeChanges: NodeChange[]) => {
      nodeChanges.forEach((nodeChange) => {
        if (nodeChange.type === "position" && nodeChange.positionAbsolute) {
          const node = nodes.find((node) => node.id === nodeChange.id);
          if (!node) return;

          // Process incoming nodes and update edges
          const incomingNodes = getIncomers(node, nodes, edges);
          incomingNodes.forEach((incomingNode) => {
            const edge = edges.find(
              (edge) => edge.id === `${incomingNode.id}-${node.id}`
            );
            const edgeConfig = currentDatabase.edgeConfigs.find(
              (edgeConfig: EdgeConfig) =>
                edgeConfig.source === incomingNode.id &&
                edgeConfig.target === node.id
            );

            if (nodeChange.positionAbsolute?.x) {
              setEdges((eds) =>
                eds.map((ed) => {
                  if (edge && ed.id === edge.id) {
                    const sourcePosition =
                      edgeConfig!.sourcePosition ||
                      calculateSourcePosition(
                        incomingNode.width as number,
                        incomingNode.position.x,
                        node.width as number,
                        nodeChange.positionAbsolute!.x
                      );
                    const targetPosition =
                      edgeConfig!.targetPosition ||
                      calculateTargetPosition(
                        incomingNode.width as number,
                        incomingNode.position.x,
                        node.width as number,
                        nodeChange.positionAbsolute!.x
                      );

                    const sourceHandle = `${edgeConfig!.sourceKey}-${sourcePosition}`;
                    const targetHandle = `${edgeConfig!.targetKey}-${targetPosition}`;

                    ed.sourceHandle = sourceHandle;
                    ed.targetHandle = targetHandle;
                    ed.className = edgeClassName(edgeConfig, targetPosition);
                    ed.markerEnd = edgeMarkerName(edgeConfig, targetPosition);
                  }
                  return ed;
                })
              );
            }
          });

          // Process outgoing nodes and update edges
          const outgoingNodes = getOutgoers(node, nodes, edges);
          outgoingNodes.forEach((targetNode) => {
            const edge = edges.find(
              (edge) => edge.id === `${node.id}-${targetNode.id}`
            );
            const edgeConfig = currentDatabase.edgeConfigs.find(
              (edgeConfig: EdgeConfig) =>
                edgeConfig.source === nodeChange.id &&
                edgeConfig.target === targetNode.id
            );

            if (nodeChange.positionAbsolute?.x) {
              setEdges((eds) =>
                eds.map((ed) => {
                  if (edge && ed.id === edge.id) {
                    const sourcePosition =
                      edgeConfig!.sourcePosition ||
                      calculateSourcePosition(
                        node.width as number,
                        nodeChange.positionAbsolute!.x,
                        targetNode.width as number,
                        targetNode.position.x
                      );
                    const targetPosition =
                      edgeConfig!.targetPosition ||
                      calculateTargetPosition(
                        node.width as number,
                        nodeChange.positionAbsolute!.x,
                        targetNode.width as number,
                        targetNode.position.x
                      );

                    const sourceHandle = `${edgeConfig!.sourceKey}-${sourcePosition}`;
                    const targetHandle = `${edgeConfig!.targetKey}-${targetPosition}`;

                    ed.sourceHandle = sourceHandle;
                    ed.targetHandle = targetHandle;
                    ed.className = edgeClassName(edgeConfig, targetPosition);
                    ed.markerEnd = edgeMarkerName(edgeConfig, targetPosition);
                  }
                  return ed;
                })
              );
            }
          });
        }
      });

      onNodesChange(nodeChanges);
    },
    [onNodesChange, setEdges, nodes, edges, currentDatabase]
  );

  const toggleFullScreen = () => {
    if (fullscreenOn) {
      document
        .exitFullscreen()
        .then(() => {
          setFullScreen(false);
        })
        .catch((error) => {
          alert("Can't exit fullscreen");
          console.error(error);
        });
    } else {
      const element = document.querySelector("body");
      element &&
        element
          .requestFullscreen()
          .then(() => {
            setFullScreen(true);
          })
          .catch((error) => {
            alert("Can't turn on fullscreen");
            console.error(error);
          });
    }
  };

  return (
    // Option 1: Using inline styles to define the container's dimensions
    <div className="Flow" style={{ width: "80%", height: "80vh" }}>
      <Markers />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onInit={onInit}
        snapToGrid={true}
        fitView
        snapGrid={[16, 16]}
        nodeTypes={nodeTypes}
        onNodeMouseEnter={onNodeMouseEnter}
        onNodeMouseLeave={onNodeMouseLeave}
        onSelectionChange={onSelectionChange}
      >
        <Controls showInteractive={false}>
          <ControlButton onClick={toggleFullScreen}>
            {!fullscreenOn ? <MaximizeIcon /> : <MinimizeIcon />}
          </ControlButton>
          <ControlButton
            onClick={() => setInfoPopupOn(!infoPopupOn)}
            className="into-popup-toggle"
          >
            <InfoIcon />
          </ControlButton>
          <ControlButton
            onClick={() => setDatabaseMenuPopupOn(true)}
            className="into-popup-toggle"
          >
            <DatabaseIcon />
          </ControlButton>
        </Controls>
        <Background color="#aaa" gap={16} />
      </ReactFlow>
      {infoPopupOn && <InfoPopup onClose={() => setInfoPopupOn(false)} />}
      {unknownDatasetOn && (
        <DatabaseMenuPopup
          headline={"Unknown dataset :warning:"}
          subheadline={"Available datasets :point_down:"}
          onClose={() => setUnknownDatasetOn(false)}
        />
      )}
      {databaseMenuPopupOn && (
        <DatabaseMenuPopup
          headline={"Choose a dataset :point_down:"}
          onClose={() => setDatabaseMenuPopupOn(false)}
        />
      )}
    </div>
  );
};

// Main Visualizer Component
const Visualizer: React.FC<VisualizerProps> = (props: VisualizerProps) => {
  const [currentDatabase, setCurrentDatabase] = useState({
    tables: [],
    edgeConfigs: [],
    schemaColors: {},
    tablePositions: {},
  } as DatabaseConfig);
  const [databasesLoaded, setDatabasesLoaded] = useState(false);

  useEffect(() => {
    loadDatabases()
      .then((data) => {
        console.log("Loaded databases:", data);
        if (!props.database || !(props.database in data)) {
          console.error(
            "Database key not found:",
            props.database,
            "Loaded keys:",
            Object.keys(data)
          );
          return;
        }
        const databaseConfig = data[props.database] as DatabaseConfig;
        console.log(
          "Using database config for:",
          props.database,
          databaseConfig
        );
        setCurrentDatabase(databaseConfig);
        setDatabasesLoaded(true);
      })
      .catch((err) => {
        console.error("Error loading databases:", err);
      });
  }, [props.database]);

  return (
    <ReactFlowProvider>
      {databasesLoaded && <Flow currentDatabase={currentDatabase} />}
    </ReactFlowProvider>
  );
};

export default Visualizer;
