
-- Default admin user with password "changeit"
insert into user (username, password, data) VALUES ('admin', '{bcrypt}$2a$10$OLQr1kH9kjDnbWWV67xSH.A32C19/LZpPKiTkoHlfQ4rYadm/DmIG', '{"roles":["ADMIN"]}');
