import React from 'react';
import DetailRow from '../DetailRow/DetailRow';
import { getAccountStatusDisplay, getRoleDisplay, getRoleClassName } from '../../utils/dashboardHelpers';
import './UserInfoSection.css';

const UserInfoSection = ({
    user,
    deletingAccount,
    canDeleteAccount = true,
    deleteAccountHint = '',
    onDeleteAccount,
}) => {
    return (
        <section className="user-info-section">
            <h2>Account</h2>
            <div className="user-details-card">
                <DetailRow label="Name:" value={user?.name} />
                <DetailRow
                    label="Role:"
                    value={getRoleDisplay(user?.role)}
                    valueClassName={getRoleClassName(user?.role)}
                />
                <DetailRow
                    label="Status:"
                    value={getAccountStatusDisplay(user)}
                />
            </div>
            <div className="account-danger-zone">
                <h3>Danger zone</h3>
                <p>Delete account and clear all related mapping data.</p>
                <button
                    type="button"
                    className="danger-button"
                    onClick={onDeleteAccount}
                    disabled={deletingAccount || !canDeleteAccount}
                    title={deleteAccountHint}
                >
                    {deletingAccount ? 'Deleting...' : 'Delete account'}
                </button>
            </div>
        </section>
    );
};

export default UserInfoSection;
