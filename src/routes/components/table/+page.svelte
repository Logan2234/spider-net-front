<script lang="ts">
  import Switch from '$lib/components/base/switch.svelte';
  import Table from '$lib/components/table/table.svelte';
  import notifications from '$lib/stores/notifications';
  import type { IColumn, TableOnLoadFunction } from '$lib/types/table';
  import { fakerFR as faker } from '@faker-js/faker';

  const data = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
    email: faker.internet.email(),
    ip: faker.internet.ipv4(),
    alive: faker.datatype.boolean(),
    birthDate: faker.date.birthdate()
  }));

  const cols: IColumn[] = [
    { name: 'id', label: 'ID', minWidth: '200px' },
    { name: 'firstname', label: 'First Name', maxWidth: '100px' },
    { name: 'lastname', label: 'Last Name', resizable: true },
    { name: 'email', label: 'Email' },
    { name: 'ip', label: 'IP Address' },
    { command: true, name: '', render: () => 'Voir' },
    {
      name: 'alive',
      label: 'Alive',
      render: (data: any) =>
        `<span class="${data.alive ? 'text-green-500' : 'text-red-500'}">${data.alive}</span>`
    },
    {
      name: 'birthDate',
      label: 'Date de naissance',
      sortable: true,
      render: (data: any) => `<span>${new Date(data.birthDate).toLocaleDateString()}</span>`
    }
  ];

  const onLoad: TableOnLoadFunction = async (page, pageSize, sort, search, filter) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const results1 = search
      ? data.filter((elem) => elem.firstname.includes(search) || elem.lastname.includes(search))
      : data;

    const results = results1.toSorted((a: any, b: any) => {
      if (sort?.by === 'birthDate') {
        return sort.dir === 1
          ? new Date(a.birthDate).getTime() - new Date(b.birthDate).getTime()
          : sort.dir === -1
            ? new Date(b.birthDate).getTime() - new Date(a.birthDate).getTime()
            : 0;
      }

      return 0;
    });

    return {
      results: results.slice(pageSize * (page - 1), pageSize * page),
      count: results.length
    };
  };

  let selectable = $state(true);
  let withGlobalSearch = $state(true);
  let infiniteScroll = $state(true);
  let repeatHeaderInFooter = $state(false);
  let withTableName = $state(true);
  let withDoubleClick = $state(true);
  let withContextMenu = $state(true);
  let stickyHeader = $state(false);
  let stickFirstColumn = $state(false);
  let selectedLines = $state([]);

  const onDoubleClick = (item: any) => {
    notifications.showNotification(JSON.stringify(item, null, 2), 'info');
  };

  const contextMenuActions = [
    {
      label: 'Action 1',
      icon: 'fa-mouse',
      onclick: () => {
        notifications.showNotification('Action 1', 'success', 2500, 'Test');
      }
    },
    {
      label: 'Action 2',
      icon: 'fa-bed',
      onclick: () => {
        notifications.showNotification('Toh!', 'error', 2500);
      }
    },
    {
      label: 'Number of selected',
      icon: 'fa-dollar',
      onclick: () => {
        notifications.showNotification(selectedLines.length + ' lines selected', 'info');
      }
    }
  ];
</script>

<h1 class="text-2xl font-bold">Parameters</h1>

<div class="flex gap-12">
  <Switch bind:value={selectable} label="selectable" />
  <Switch bind:value={withGlobalSearch} label="withGlobalSearch" />
  <Switch bind:value={repeatHeaderInFooter} label="repeatHeaderInFooter" />
  <Switch bind:value={infiniteScroll} label="infiniteScroll" />
  <Switch bind:value={withTableName} label="withTableName" />
  <Switch bind:value={withDoubleClick} label="withDoubleClick" />
  <Switch bind:value={withContextMenu} label="withContextMenu" />
  <Switch bind:value={stickyHeader} label="stickyHeader" disabled />
  <Switch bind:value={stickFirstColumn} label="stickFirstColumn" disabled />
</div>

<hr class="my-4" />

<Table
  {cols}
  {onLoad}
  {repeatHeaderInFooter}
  {selectable}
  {stickyHeader}
  {stickFirstColumn}
  {withGlobalSearch}
  {infiniteScroll}
  bind:selectedLines
  contextMenuActions={withContextMenu ? contextMenuActions : []}
  tableName={withTableName ? 'test' : undefined}
  onDoubleClick={withDoubleClick ? onDoubleClick : undefined} />
