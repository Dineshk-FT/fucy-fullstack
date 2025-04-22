import React from 'react';
import { Zoom } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';

export default function ContextMenu({
    visible,
    x,
    y,
    options = [],
    isDark,
    handleMenuOptionClick,
}) {
    if (!visible) return null;

    return (
        <Zoom in={visible}>
            <div
                style={{
                    position: 'absolute',
                    top: y,
                    left: x,
                    background: isDark ? 'rgba(30,30,30,0.95)' : 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(4px)',
                    border: 'none',
                    borderRadius: '6px',
                    boxShadow: isDark
                        ? '0 3px 10px rgba(0,0,0,0.5)'
                        : '0 3px 10px rgba(0,0,0,0.15)',
                    zIndex: 1000,
                    width: '120px',
                    padding: '6px 0',
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '13px',
                    color: isDark ? '#E0E0E0' : '#333333',
                }}
            >
                {options.map((option, idx) => (
                    <div
                        key={option}
                        role="menuitem"
                        tabIndex={0}
                        style={{
                            padding: '6px 12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            borderBottom:
                                idx < options.length - 1
                                    ? `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`
                                    : 'none',
                            transition: 'all 0.3s ease',
                        }}
                        onClick={() => handleMenuOptionClick(option)}
                        onKeyDown={e => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                handleMenuOptionClick(option);
                            }
                        }}
                        onMouseEnter={e =>
                        (e.target.style.backgroundColor = isDark
                            ? 'rgba(100,181,246,0.15)'
                            : 'rgba(33,150,243,0.08)')
                        }
                        onMouseLeave={e =>
                            (e.target.style.backgroundColor = 'transparent')
                        }
                    >
                        <span style={{ marginRight: '8px', color: isDark ? '#64B5F6' : '#2196F3' }}>
                            {option === 'Copy' && <ContentCopyIcon sx={{ fontSize: 16 }} />}
                            {option === 'Paste' && <ContentPasteIcon sx={{ fontSize: 16 }} />}
                        </span>
                        {option}
                    </div>
                ))}
            </div>
        </Zoom>
    );
}