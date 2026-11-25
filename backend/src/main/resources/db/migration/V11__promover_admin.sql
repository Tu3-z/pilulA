-- Promove a conta admin@admin.com para o perfil ADMIN
UPDATE usuario SET perfil = 'ADMIN' WHERE email = 'admin@admin.com';
