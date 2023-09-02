<script lang='ts'>

  import { beforeNavigate, afterNavigate, goto, invalidate, invalidateAll }
    from '$app/navigation';
  import type { PageData }
    from './$types';

  export let data: PageData;

  beforeNavigate(
    () => console.log( 'navigation', 'before' ) );
  afterNavigate(
    () => console.log( 'navigation', 'after' ) );

  let dependencies = new Map( [
    [ 'a', false ],
    [ 'b', false ],
    [ 'c', false ],
  ] );

  $: dependencies = new Map( [
    ...new Map(
      [ ...dependencies ].map( dependency => [ dependency[0], false ] ) ),
    ...dependenciesForScript(
      data.dependencies ),
  ] );

  let loading = 0;
  $: loading = data.nonce;

  $: data.nonce, setTimeout( () => { loading = 0 }, 100 );

  /** Convert `[ [ 'depend', 'resource:a' ], ... ]` to `Map { 'a' => true, ... }` */

  function dependenciesForScript( dependencies: LoadDependencies ): ScriptDependencies {
    return new Map( dependencies.map(
      dependency => [ dependency[1].replace( /resource:/, '' ), true ]
    ));
  }

  type ScriptDependencies = Map<string,boolean>;

  /** Convert `Map { 'a' => true, 'b' => false, ... }` to `[ [ 'depend', 'resource:a' ], ... ]` */

  function dependenciesForLoad( dependencies: ScriptDependencies ): LoadDependencies {
    return [ ...dependencies ]
      .filter( dependency => dependency[1] )
      .map( dependency => [ 'depend', `resource:${ dependency[0] }` ] );
  }

  type LoadDependencies = Array<['depend',string]>;

  /** Enable or disable a dependency */

  function update( resource: string, value: boolean ) {
    const requests =
      dependenciesForLoad( new Map( [ ...dependencies, [ resource, value ] ] ) );
    if ( requests.length ) {
      goto( search( requests ) );
    } else {
      reset();
    }
  }

  /** Disable all dependencies */

  function reset() {
    goto( search( { nonce: `${ +new Date() }` } ) );
  }

  /** Render a `?k=v&...` URL search string */

  function search( params: Record<string,string> | string[][] ): string {
    return `?${ new URLSearchParams( params ) }`;
  }

  /** `invalidate` with logging */

  function invalidateAndLog( url: string ) {
    console.log( 'event', `invalidate('${ url }')` );
    return invalidate( url );
  }

  /** `invalidateAll` with logging */

  function invalidateAllAndLog() {
    console.log( 'event', `invalidateAll()` );
    return invalidateAll();
  }

</script>

<h1>Invalidation</h1>

<table style:background-color={ loading ? 'var(--disabled)' : undefined }>

  <tr>
    <td colspan='3'>
      <input type='button' value='reset' on:click={ () => reset() }>
    </td>
  </tr>

  { #each dependencies as [ resource, value ] }
    <tr>
      <th>
        <code>{ `resource:${ resource }` }</code>
      </th>
      <td><label>
        <input type='checkbox' checked={ value }
          on:change={ event => update( resource, event.currentTarget.checked ) }/>
        <code>depends</code>
      </label></td>
      <td>
        <input type='button' value='invalidate'
          on:click={ () => invalidateAndLog( `resource:${ resource }` ) }>
      </td>
    </tr>
  { /each }

  <tr>
    <td colspan='3'>
      <input type='button' value='invalidateAll'
        on:click={ () => invalidateAllAndLog() }>
    </td>
  </tr>

</table>

<style>
  input[type='button'] {
    margin-bottom: 0 }
  td:last-child, th:last-child {
    text-align: end }
  th {
    background-color: inherit }
  tr:nth-child(even) {
    background-color: inherit }
</style>
