-- Initial system roles
INSERT INTO
    roles (key, description)
VALUES (
        'admin',
        'Full administrative access'
    ),
    (
        'customer',
        'Standard customer access'
    ),
    (
        'support',
        'Customer support access'
    ) ON CONFLICT (key) DO NOTHING;

-- Initial system permissions
INSERT INTO
    permissions (key, description)
VALUES
        (
            'product:create',
            'Create products'
        ),
        (
            'product:update',
            'Update Products'
        ),
        (
            'product:archive',
            'Archive Products'
        ),
        (
            'product:read',
            'Read products'
        ),
        ('order:read', 'Read orders'),
        (
            'order:cancel',
            'Cancel orders'
        ),
        (
            'user:read',
            'Read user profiles'
        ),
        (
            'user:update',
            'Update user profiles'
        ) ON CONFLICT (key) DO NOTHING;

-- Admin receives all initial permissions
INSERT INTO
    role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
    CROSS JOIN permissions p
WHERE
    r.key = 'admin'
    AND p.key IN (
        'product:create',
        'product:update',
        'product:archive',
        'product:read',
        'order:read',
        'order:cancel',
        'user:read',
        'user:update'
    ) ON CONFLICT DO NOTHING;

-- Customer permissions
INSERT INTO
    role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
    JOIN permissions p ON p.key IN (
        'product:read', 'order:read', 'order:cancel', 'user:read', 'user:update'
    )
WHERE
    r.key = 'customer' ON CONFLICT DO NOTHING;

-- Support permission
INSERT INTO
    role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
    JOIN permissions p ON p.key IN (
        'product:read', 'order:read', 'user:read'
    )
WHERE
    r.key = 'support' ON CONFLICT DO NOTHING;