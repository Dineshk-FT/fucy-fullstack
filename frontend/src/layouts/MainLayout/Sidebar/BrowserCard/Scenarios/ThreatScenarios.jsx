import React from 'react';
import DraggableTreeItem from '../DraggableItem';
import { threatType } from '../../../../../components/Table/constraints';

const ThreatScenarios = ({ sub, detail, i, setSelectedThreatIds, onDragStart, getLabel }) => {
  return (
    <>
      {(sub.name === 'Threat Scenarios'
        ? detail.Details.flatMap((nodeDetail) =>
            nodeDetail?.props?.map((prop) => {
              return {
                label: `[TS${prop?.key.toString().padStart(3, '0')}] ${threatType(prop?.name)} of ${nodeDetail?.node} leads to ${
                  detail?.damage_name
                } [${detail?.id}]`,
                nodeId: nodeDetail?.nodeId,
                index: prop?.key,
                extraProps: {
                  threatId: prop?.id,
                  damageId: detail?.rowId,
                  width: 150,
                  height: 60,
                  key: `TS${prop?.key.toString().padStart(3, '0')}`
                }
              };
            })
          )
        : [
            {
              label: `[TSD${(i + 1).toString().padStart(3, '0')}] ${detail?.name}`,
              nodeId: detail?.id,
              extraProps: { ...detail, nodeType: 'derived', width: 150, height: 60 }
            }
          ]
      ).map(({ label, nodeId, extraProps, index }) => {
        const onClick = (e) => {
          e.stopPropagation();
          const ids = extraProps?.threat_ids ? extraProps?.threat_ids?.map((threat) => threat?.propId) : [];
          setSelectedThreatIds(ids);
        };
        return (
          <DraggableTreeItem
            draggable={true}
            key={index ?? nodeId}
            nodeId={nodeId}
            label={getLabel('TopicIcon', label, index ?? i + 1, nodeId, extraProps?.threat_ids, onClick)}
            onDragStart={(e) => onDragStart(e, { label, type: 'default', dragged: true, nodeId, ...extraProps })}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedThreatIds([]);
            }}
          />
        );
      })}
    </>
  );
};

export default React.memo(ThreatScenarios);
