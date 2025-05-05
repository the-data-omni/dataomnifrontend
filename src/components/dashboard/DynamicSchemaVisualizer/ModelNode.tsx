import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Handle, NodeProps, Position } from "reactflow";
import { Model } from "./SchemaVisualizer.types";

export default function ModelNode({ data }: NodeProps<Model>) {
  return (
    <Box sx={{ borderRadius: "8px", minWidth: "250px" }}>
      {data.isChild && (
        <Handle id={data.name} position={Position.Top} type="target" />
      )}
      <Box
        sx={{
          p: 1,
          textAlign: "center",
          borderRadius: "8px 8px 0 0",
          backgroundColor: "#3d5787",
        }}
      >
        <Typography fontWeight="bold" color="white">
          <pre>{data.name}</pre>
        </Typography>
      </Box>
      {data.fields.map(({ type, name, hasConnections }, index) => (
        <Box
          key={index}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            p: 1,
            color: "white",
            backgroundColor: index % 2 === 0 ? "#282828" : "#232323",
          }}
        >
          <Typography>
            <pre>{name}</pre>
          </Typography>
          <Typography>
            <pre>{type}</pre>
          </Typography>
          {hasConnections && (
            <Handle
              position={Position.Right}
              id={`${data.name}-${name}`}
              type="source"
              style={{ top: 32 + 16 + 32 * index }}
            />
          )}
        </Box>
      ))}
    </Box>
  );
}
