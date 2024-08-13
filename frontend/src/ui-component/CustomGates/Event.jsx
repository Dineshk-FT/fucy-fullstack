import React, { useEffect, useState } from 'react';
import { Handle, Position } from 'reactflow';
import useStore from '../../Zustand/store';
import AddPropertiesGate from '../Modal/AddPropertiesGate';
import { colorPickerTab } from './colorPicker';

const selector = (state) => ({
    update: state.updateAttackNode
});
export default function Event(props) {
    const { update } = useStore(selector);
    const [inputValue, setInputValue] = useState('');
    const [open, setOpen] = useState(false);
    const handleopenModal = (e) => {
        e.preventDefault();
        // console.log('props', props)
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };
    // console.log('data', data);

    useEffect(() => {
        if (props.data.label) {
            setInputValue(props?.data?.label);
        }
    }, [props.data]);
    const handleChange = (e) => {
        const { value } = e.target;
        // console.log('value', value)
        setInputValue(value);
        update(props?.id, value);
    };

    return (
        <>
            <Handle type="target" position={Position.Top} style={{ top: '-12px', opacity: 0 }} />
            <div onContextMenu={handleopenModal}>
                <input
                    type="text"
                    value={inputValue}
                    style={{
                        borderRadius: '4px',
                        width: `${Math.max(100, inputValue.length * 7)}px`,
                        minWidth: '100px',
                        maxWidth: 'auto',
                        textAlign: 'center',
                        background: 'transparent',
                        border: `1px solid ${colorPickerTab(props?.data?.status)}`
                    }}
                    onChange={handleChange}
                />
            </div>
            <Handle type="source" position={Position.Bottom} style={{ bottom: '-12px', opacity: 0 }} />
            {open && <AddPropertiesGate open={open} handleClose={handleClose} updateNode={props} />}
        </>
    );
}
