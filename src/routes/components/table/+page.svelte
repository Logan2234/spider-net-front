<script lang="ts">
  import Switch from '$lib/components/base/switch.svelte';
  import Table from '$lib/components/table/table.svelte';
  import notifications from '$lib/stores/notifications';
  import type { IColumn, TableOnLoadFunction } from '$lib/types/table';
  import { fakerFR as faker } from '@faker-js/faker';

  const data = Array.from({ length: 1000 }, (_, i) => ({
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
    { name: 'lastname', label: 'Last Name' },
    { name: 'email', label: 'Email' },
    { name: 'ip', label: 'IP Address' },
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
    await new Promise((resolve) => setTimeout(resolve, 50));

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
  let withDoubleClickFunction = $state(true);
  let withGlobalSearch = $state(true);
  let repeatHeaderInFooter = $state(false);
  let stickyHeader = $state(false);
  let stickFirstColumn = $state(false);

  const onDoubleClick = (item: any) => {
    notifications.showNotification(JSON.stringify(item, null, 2), 'info');
  };
</script>

<h1 class="text-2xl font-bold">Parameters</h1>

<div class="flex gap-12">
  <Switch bind:value={selectable} label="selectable" />
  <Switch bind:value={withGlobalSearch} label="withGlobalSearch" />
  <Switch bind:value={withDoubleClickFunction} label="withDoubleClickFunction" />
  <Switch bind:value={repeatHeaderInFooter} label="repeatHeaderInFooter" />
  <Switch bind:value={stickyHeader} label="stickyHeader" disabled />
  <Switch bind:value={stickFirstColumn} label="stickFirstColumn" disabled />
</div>

<hr />

<Table
  {cols}
  {onLoad}
  {repeatHeaderInFooter}
  {selectable}
  {stickyHeader}
  {stickFirstColumn}
  {withGlobalSearch}
  onDoubleClick={withDoubleClickFunction ? onDoubleClick : undefined} />
