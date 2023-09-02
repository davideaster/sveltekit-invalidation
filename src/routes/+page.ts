import type { PageLoad } from './$types';
 
export const load: PageLoad = ({ url, depends }) => {

  console.log( 'load' );

  url.searchParams.getAll( 'depend' ).forEach( depend => {
    dependsAndLog( depend );
  } );

  return {
    dependencies:
      [ ...url.searchParams ].filter( param => param[0] === 'depend' ) as Array<['depend',string]>,
    nonce:
      +new Date()
  };

  function dependsAndLog( depend: string ) {
    console.log( 'load', `depends('${ depend }')` );
    return depends( depend );
  }

};
