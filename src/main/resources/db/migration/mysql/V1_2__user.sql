create table user
(
    id                 bigint not null auto_increment,
    username           varchar(191) not null,
    password           varchar(191) not null,
    disabled           bit not null default 0,
    data               text,
    primary key (id)
) engine = InnoDB;

alter table user add unique UQ_user_username (username);
