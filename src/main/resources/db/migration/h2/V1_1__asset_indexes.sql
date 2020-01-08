alter table asset
    add constraint UQ_asset_inventory_id unique (inventory_id);
