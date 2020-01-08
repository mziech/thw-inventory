create table user
(
    id                 bigint not null auto_increment,
    username           varchar(255) not null,
    password           varchar(255) not null,
    disabled           bit not null default 0,
    data               text,
    primary key (id)
);

alter table user add unique UQ_user_username (username);
