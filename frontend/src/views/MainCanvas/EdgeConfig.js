import { MarkerType } from 'reactflow';
import { useCallback, useMemo } from 'react';
import { CustomEdge } from '../../ui-component/custom';
import StepEdge from '../../ui-component/custom/edges/StepEdge';

export const useEdgeConfig = () => {
  const connectionLineStyle = useMemo(
    () => ({
      stroke: '#64B5F6',
      strokeWidth: 2,
      strokeDasharray: '5,5'
    }),
    []
  );

  const edgeOptions = useMemo(
    () => ({
      type: 'step',
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 18,
        height: 18,
        color: '#64B5F6'
      },
      markerStart: {
        type: MarkerType.ArrowClosed,
        orient: 'auto-start-reverse',
        width: 18,
        height: 18,
        color: '#64B5F6'
      },
      animated: true,
      style: {
        strokeWidth: 2,
        stroke: '#808080',
        start: false,
        end: true,
        strokeDasharray: '0'
      },
      properties: ['Confidentiality'],
      data: {
        label: 'edge',
        style: {
          background: 'rgba(255, 255, 255, 0.8)',
          borderRadius: '4px',
          padding: '2px 4px',
          fontFamily: "'Poppins', sans-serif",
          fontSize: '12px',
          color: '#333333'
        }
      }
    }),
    []
  );

  const CustomStepEdge = useCallback((props) => <StepEdge {...props} />, []);

  const edgeTypes = useMemo(
    () => ({
      custom: CustomEdge,
      step: CustomStepEdge
    }),
    [CustomEdge, CustomStepEdge]
  );

  return { connectionLineStyle, edgeOptions, edgeTypes };
};
