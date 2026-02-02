import React from 'react';
import { DeleteModal, Modal, ModalContent, ModalHeader, ModalOverlay } from '../../components/common/Modal';
import { useUsers } from './hooks/useUsers';
import './Users.css';

const Users = () => {
    const {
        users,
        areaCounts,
        loading,
        error,
        pendingUserId,
        currentUserId,
        editingUser,
        editVisible,
        formData,
        setFormData,
        deleteUser,
        deleteVisible,
        openEdit,
        closeEdit,
        saveUser,
        openDelete,
        closeDelete,
        confirmDelete,
        blockUser,
        unblockUser,
        openUserAreas,
        reload
    } = useUsers();

    const getUserStatus = (user) => {
        if (user.blocked) return { text: 'Blocked', className: 'status-badge status-blocked' };
        if (user.deleted) return { text: 'Deleted', className: 'status-badge status-deleted' };
        return { text: 'Active', className: 'status-badge status-active' };
    };

    const activeAdminCount = users.filter((user) =>
        user.role === 'ADMIN' && !user.deleted && !user.blocked
    ).length;

    const isLastActiveAdmin = (user) =>
        user.role === 'ADMIN' && !user.deleted && !user.blocked && activeAdminCount === 1;

    return (
        <div className="users-page">
            <div className="card">
                <div className="users-header">
                    <h2>Users</h2>
                    <button type="button" className="btn btn-secondary" onClick={reload}>Reload</button>
                </div>

                {loading && <p>Loading users...</p>}
                {error && (
                    <div className="users-error">
                        <span>{error}</span>
                        <button type="button" className="btn btn-secondary" onClick={reload}>Retry</button>
                    </div>
                )}

                {!loading && !error && (
                    <div className="users-table-wrap">
                        <table className="users-table">
                            <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Telegram ID</th>
                                <th>Role</th>
                                <th>Areas</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {users.map((user) => {
                                const status = getUserStatus(user);
                                const lastActiveAdmin = isLastActiveAdmin(user);
                                const isSelf = currentUserId === user.id;
                                return (
                                    <tr key={user.id}>
                                        <td>{user.id}</td>
                                        <td>{user.name}</td>
                                        <td>{user.telegramId}</td>
                                        <td>{user.role}</td>
                                        <td>{areaCounts[user.id] ?? 0}</td>
                                        <td>
                                            <span className={status.className}>
                                                {status.text}
                                            </span>
                                        </td>
                                        <td className="users-actions">
                                            <button type="button" className="btn btn-secondary" onClick={() => openUserAreas(user.id)}>
                                                Areas
                                            </button>
                                            <button type="button" className="btn btn-secondary" onClick={() => openEdit(user)}>
                                                Edit
                                            </button>
                                            {user.blocked ? (
                                                <button
                                                    type="button"
                                                    className="btn btn-success"
                                                    onClick={() => unblockUser(user.id)}
                                                    disabled={pendingUserId === user.id}
                                                >
                                                    Unblock
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="btn btn-warning"
                                                    onClick={() => blockUser(user.id)}
                                                    disabled={pendingUserId === user.id || isSelf || lastActiveAdmin}
                                                    title={
                                                        isSelf
                                                            ? 'You cannot block yourself'
                                                            : (lastActiveAdmin ? 'Cannot block the last active admin' : '')
                                                    }
                                                >
                                                    Block
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                className="btn btn-danger"
                                                onClick={() => openDelete(user)}
                                                disabled={pendingUserId === user.id || isSelf || lastActiveAdmin}
                                                title={
                                                    isSelf
                                                        ? 'You cannot delete yourself'
                                                        : (lastActiveAdmin ? 'Cannot delete the last active admin' : '')
                                                }
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {editVisible && (
                <ModalOverlay onClick={closeEdit}>
                    <Modal size="md">
                        <ModalHeader title={`Edit user #${editingUser?.id || ''}`} onClose={closeEdit} />
                        <ModalContent>
                            <form onSubmit={saveUser} className="users-form">
                                <label className="form-label">
                                    Name
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.name}
                                        onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
                                        required
                                    />
                                </label>

                                <label className="form-label">
                                    Telegram ID
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.telegramId}
                                        onChange={(event) => setFormData((prev) => ({ ...prev, telegramId: event.target.value }))}
                                        required
                                    />
                                </label>

                                <label className="form-label">
                                    Role
                                    <select
                                        className="form-input"
                                        value={formData.role}
                                        onChange={(event) => setFormData((prev) => ({ ...prev, role: event.target.value }))}
                                    >
                                        <option value="USER" disabled={editingUser ? isLastActiveAdmin(editingUser) : false}>USER</option>
                                        <option value="ADMIN">ADMIN</option>
                                    </select>
                                </label>

                                <div className="form-actions">
                                    <button type="button" className="btn btn-secondary" onClick={closeEdit}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">Save</button>
                                </div>
                            </form>
                        </ModalContent>
                    </Modal>
                </ModalOverlay>
            )}

            <DeleteModal
                visible={deleteVisible}
                itemName={deleteUser?.name}
                itemType="user"
                warningText="All related areas, floors and fulcrums will be marked deleted."
                onConfirm={confirmDelete}
                onCancel={closeDelete}
            />
        </div>
    );
};

export default Users;
