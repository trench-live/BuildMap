import React from 'react';
import './Button.css';

const Button = ({
                    children,
                    variant = 'secondary',
                    size = 'medium',
                    onClick,
                    type = 'button',
                    disabled = false,
                    className = ''
                }) => {
    const buttonClass = `btn btn-${variant} btn-${size} ${className}`.trim();

    return (
        <button
            type={type}
            className={buttonClass}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
};

export default Button;