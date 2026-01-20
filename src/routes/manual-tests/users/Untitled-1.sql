select * from roles;

SELECT user_id,
       role_id,
       "createdAt"
FROM public.user_roles;

select * from users; 

-- INSERT INTO user_roles (user_id, role_id)
-- VALUES
-- ((SELECT user_id FROM users WHERE username = 'Peter Korosec'), (SELECT role_id FROM roles WHERE role_name = 'vet')),
-- ((SELECT user_id FROM users WHERE username = 'Peter Korosec'), (SELECT role_id FROM roles WHERE role_name = 'spectator'));