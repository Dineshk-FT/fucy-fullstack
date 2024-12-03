import { v4 as uid } from 'uuid';

export const updatedModelState = (mod, nodes, edges) => {
  // console.log('mod', mod);
  let Derivations = nodes
    ?.filter((nd) => nd?.type !== 'group')
    ?.map((node) => {
      return node?.properties.map((pr) => ({
        task: `Check for Damage Scenario for loss of ${pr} for ${node?.data?.label}`,
        name: `Damage Scenario for loss of ${pr} for ${node?.data?.label}`,
        loss: `loss of ${pr}`,
        asset: node?.isAsset,
        damageScene: []
      }));
    })
    .flat()
    .map((dr, i) => ({ ...dr, id: `DS00${i + 1}` }));

  let Details = nodes
    ?.filter((nd) => nd?.type !== 'group')
    ?.map((node) => ({
      id: uid(),
      nodeId: node?.id,
      name: node?.data?.label,
      props: node?.properties.map((pr) => ({ name: pr, id: uid() }))
    }));

  mod.template = { nodes, edges };
  mod.scenarios[0].Details = Details;
  mod.scenarios[1].subs[0].Details = Derivations;
  // mod.scenarios[1].subs[0].losses = [];
  mod.scenarios[1].subs[1].Details = Details;
  mod.scenarios[2].Details = Details;

  return mod;
};

export const style = {
  fontSize: '16px',
  fontFamily: 'Inter',
  fontStyle: 'normal',
  fontWeight: 500,
  textAlign: 'center',
  color: 'white',
  textDecoration: 'none',
  borderColor: 'black',
  borderWidth: '2px',
  borderStyle: 'solid'
};
