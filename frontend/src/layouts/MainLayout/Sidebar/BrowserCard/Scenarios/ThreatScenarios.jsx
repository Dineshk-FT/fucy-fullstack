/*eslint-disable*/
import React, { useState } from 'react';
import { Box, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DraggableTreeItem from '../DraggableItem';
import { threatType } from '../../../../../components/Table/constraints';
import useStore from '../../../../../store/Zustand/store';
import { shallow } from 'zustand/shallow';

const selector = (state) => ({
  setSelectedThreatIds: state.setSelectedThreatIds,
  setDerivedIds: state.setDerivedIds,
  setIsEditDerived: state.setIsEditDerived,
  setDerivationId: state.setDerivationId
});

const ThreatScenarios = ({ sub, detail, i, onDragStart, getLabel }) => {
  const { setSelectedThreatIds, setDerivedIds, setIsEditDerived, setDerivationId } = useStore(selector, shallow);

  const [hovered, setHovered] = useState({ id: '' });

  const handleEditDerived = (id, ids) => {
    setIsEditDerived(true);
    setDerivedIds(ids);
    setDerivationId(id);
  };

  const items =
    sub.name === 'Threat Scenarios'
      ? detail.Details.flatMap((nodeDetail) =>
          nodeDetail?.props?.map((prop) => {
            const label = `[TS${prop?.key.toString().padStart(3, '0')}] ${threatType(prop?.name)} of ${nodeDetail?.node} leads to ${
              detail?.damage_name
            } [${detail?.id}]`;
            const nodeId = nodeDetail?.nodeId;
            const index = prop?.key;
            const extraProps = {
              threatId: prop?.id,
              damageId: detail?.rowId,
              width: 150,
              height: 60,
              key: `TS${prop?.key.toString().padStart(3, '0')}`
            };

            const onClick = (e) => {
              e.stopPropagation();
              const ids = extraProps?.threat_ids ? extraProps?.threat_ids?.map((threat) => threat?.propId) : [];
              setSelectedThreatIds(ids);
            };

            return {
              label,
              nodeId,
              index,
              extraProps,
              onClick
            };
          })
        )
      : sub.name === 'Derived Threat Scenarios'
      ? [
          {
            label: `[TSD${(i + 1).toString().padStart(3, '0')}] ${detail?.name}`,
            nodeId: detail?.id,
            extraProps: {
              ...detail,
              nodeType: 'derived',
              width: 150,
              height: 60
            },
            index: i + 1,
            onClick: (e) => {
              e.stopPropagation();
              setSelectedThreatIds([]);
            },
            labelComponent: (labelText) => {
              const labelOnClick = (e) => {
                e.stopPropagation();
                const ids = detail?.threat_ids?.map((threat) => threat?.propId) || [];
                setSelectedThreatIds(ids);
              };

              const hasThreatIds = detail?.threat_ids?.length > 0;
              const isHovered = hovered.id === detail?.id;

              return (
                <Box
                  display="flex"
                  alignItems="center"
                  gap={1}
                  onMouseEnter={() => setHovered({ id: detail?.id })}
                  onMouseLeave={() => setHovered({ id: '' })}
                >
                  {getLabel('TopicIcon', labelText, i + 1, detail?.id, detail?.threat_ids, labelOnClick)}
                  {hasThreatIds && isHovered && (
                    <Tooltip title="Open Threat Scenarios table to update" arrow>
                      <EditIcon
                        color="action"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditDerived(detail?.id, detail?.threat_ids);
                        }}
                        sx={{
                          cursor: 'pointer',
                          '&:hover': { color: 'primary.main' },
                          ml: 1.5,
                          fontSize: 18
                        }}
                      />
                    </Tooltip>
                  )}
                </Box>
              );
            }
          }
        ]
      : [];

  return (
    <>
      {items.map(({ label, nodeId, extraProps, index, onClick, labelComponent }) => (
        <DraggableTreeItem
          draggable={true}
          key={index ?? nodeId}
          nodeId={nodeId}
          label={
            labelComponent ? labelComponent(label) : getLabel('TopicIcon', label, index ?? i + 1, nodeId, extraProps?.threat_ids, onClick)
          }
          onDragStart={(e) =>
            onDragStart(e, {
              label,
              type: 'default',
              dragged: true,
              nodeId,
              ...extraProps
            })
          }
          onClick={onClick}
        />
      ))}
    </>
  );
};

export default React.memo(ThreatScenarios);
