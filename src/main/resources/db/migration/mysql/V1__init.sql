create table assessment
(
    id           bigint not null auto_increment,
    closed_date  datetime(6),
    created_by   varchar(191),
    created_date datetime(6),
    name         varchar(191),
    open         bit    not null,
    version      integer,
    primary key (id)
) engine = InnoDB;

create table assessment_item
(
    id            bigint not null auto_increment,
    seen          bit    not null,
    version       integer,
    assessment_id bigint,
    asset_id      bigint,
    primary key (id)
) engine = InnoDB;

create table asset
(
    id           bigint not null auto_increment,
    description  varchar(191),
    device_id    varchar(191),
    inventory_id varchar(191),
    manufacturer varchar(191),
    part_id      varchar(191),
    source       text,
    unit         varchar(191),
    version      integer,
    primary key (id)
) engine = InnoDB;

create table note
(
    id                 bigint not null auto_increment,
    created_by         varchar(191),
    created_date       datetime(6),
    last_modified_by   varchar(191),
    last_modified_date datetime(6),
    text               text,
    type               varchar(32),
    version            integer,
    assessment_item_id bigint,
    asset_id           bigint not null,
    primary key (id)
) engine = InnoDB;

alter table assessment_item
    add constraint UQ_assessment_asset unique (assessment_id, asset_id);

alter table assessment_item
    add constraint FK_assessment_item_assessment
        foreign key (assessment_id)
            references assessment (id);

alter table assessment_item
    add constraint FK_assessment_item_asset
        foreign key (asset_id)
            references asset (id);

alter table note
    add constraint FK_note_assessment_item
        foreign key (assessment_item_id)
            references assessment_item (id);

alter table note
    add constraint FK_note_asset
        foreign key (asset_id)
            references asset (id);