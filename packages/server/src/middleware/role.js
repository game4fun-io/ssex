const roles = {
    user: 0,
    member: 1,
    influencer: 2,
    moderator: 3,
    admin: 4
};

module.exports = function (requiredRole) {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({ msg: 'Access denied: No role found' });
        }

        const userRoleValue = roles[req.user.role] || 0;
        const requiredRoleValue = roles[requiredRole] || 0;

        if (userRoleValue >= requiredRoleValue) {
            next();
        } else {
            res.status(403).json({ msg: 'Access denied: Insufficient permissions' });
        }
    };
};
