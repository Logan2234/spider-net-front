<script lang="ts">
  import Table from '$lib/components/table/table.svelte';
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
</script>

<Table {cols} {onLoad} stickFirstColumn selectable />
