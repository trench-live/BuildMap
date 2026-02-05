import React from 'react';
import './ModalActions.css';

const ModalActions = ({
                          children,
                          align = 'center',
                          className = ''
                      }) => {
    const actionsClass = `modal-actions modal-actions-${align} ${className}`.trim();

    return (
        <div className={actionsClass}>
            {children}
        </div>
    );
};

export default ModalActions;