create table assessment
(
    id           bigserial not null,
    closed_date  timestamp,
    created_by   varchar(255),
    created_date timestamp,
    name         varchar(255),
    open         boolean   not null,
    version      int4,
    primary key (id)
);

create table assessment_item
(
    id            bigserial not null,
    seen          boolean   not null,
    version       int4,
    assessment_id int8,
    asset_id      int8,
    primary key (id)
);

create table asset
(
    id           bigserial not null,
    description  varchar(255),
    device_id    varchar(255),
    inventory_id varchar(255),
    manufacturer varchar(255),
    part_id      varchar(255),
    source       text,
    unit         varchar(255),
    version      int4,
    primary key (id)
);

create table note
(
    id                 bigserial not null,
    created_by         varchar(255),
    created_date       timestamp,
    last_modified_by   varchar(255),
    last_modified_date timestamp,
    text               text,
    type               varchar(32),
    version            int4,
    assessment_item_id int8,
    asset_id           int8      not null,
    primary key (id)
);

alter table if exists assessment_item
    add constraint UQ_assessment_asset unique (assessment_id, asset_id);

alter table if exists assessment_item
    add constraint FK_assessment_item_assessment
        foreign key (assessment_id)
            references assessment;

alter table if exists assessment_item
    add constraint FK_assessment_item_asset
        foreign key (asset_id)
            references asset;

alter table if exists note
    add constraint FK_note_assessment_item
        foreign key (assessment_item_id)
            references assessment_item;

alter table if exists note
    add constraint FK_note_asset
        foreign key (asset_id)
            references asset;