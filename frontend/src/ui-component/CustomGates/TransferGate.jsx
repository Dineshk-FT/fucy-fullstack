import React, { useEffect, useState } from 'react';
import { Handle, Position } from 'reactflow';
import useStore from '../../Zustand/store';
// import Levels from '../../views/Home/Levels';
import {
    useDispatch
    // , useSelector
} from 'react-redux';
import { levelOpen } from '../../store/slices/CurrentIdSlice';
import CustomHandle from './CustomHandle';
import AddPropertiesGate from '../Modal/AddPropertiesGate';
import { colorPickerTab } from './colorPicker';

const selector = (state) => ({
    update: state.updateAttackNode
});
export default function TransferGate(props) {
    const dispatch = useDispatch();
    const [inputValue, setInputValue] = useState('');
    const { update } = useStore(selector);
    const [open, setOpen] = useState(false);
    const handleopenModal = (e) => {
        e.preventDefault();
        // console.log('props', props)
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    useEffect(() => {
        if (props.data.label) {
            setInputValue(props?.data?.label);
        }
    }, [props.data]);

    const handleDoubleClick = () => {
        const dts = {
            label: props.data.label,
            id: id
        };
        dispatch(levelOpen(dts));
    };

    const handleChange = (e) => {
        const { value } = e.target;
        setInputValue(value);
        update(props?.id, value);
    };
    return (
        <>
            <div onDoubleClick={handleDoubleClick} onContextMenu={handleopenModal}>
                <CustomHandle type="target" position={Position.Top} style={{ top: '-13px', opacity: 0 }} isConnectable={1} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <input
                        type="text"
                        style={{
                            width: '100px',
                            textAlign: 'center',
                            background: 'transparent',
                            border: `1px solid ${colorPickerTab(props?.data?.status)}`
                        }}
                        onChange={handleChange}
                        value={inputValue}
                    />
                    <svg width="100px" height="100px" viewBox="0 100 512 512" xmlns="http://www.w3.org/2000/svg">
                        <path
                            fill="none"
                            stroke={colorPickerTab(props?.data?.status)}
                            //eslint-disable-next-line
                            stroke-width="6"
                            transform="rotate(-90 256 256)"
                            d="M 105,111.3 V 400.7 L 365.5,256 Z M 16,247 v "
                        />
                    </svg>
                </div>
                <Handle type="source" position={Position.Bottom} style={{ bottom: '20px', opacity: 0 }} />
            </div>
            {/* {isLevelOpen && <Levels label={data?.label} id={id}/>} */}
            {open && <AddPropertiesGate open={open} handleClose={handleClose} updateNode={props} />}
        </>
    );
}
