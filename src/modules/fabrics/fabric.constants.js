export const FABRIC_TYPES = {
  fault_rock: 'Fault',
  igneous_rock: 'Igenous',
  metamorphic_rock: 'Metam.',
};

export const FIRST_ORDER_FABRIC_FIELDS = {
  fault_rock: ['inco_nofol', 'inco_fol', 'co_nofol', 'co_fol'],
  igneous_rock: ['planar_fab', 'lin_fab', 'magmatic_str', 'solid_state_str'],
  metamorphic_rock: ['planar_fabric', 'linear_fab', 'other_met_fab', 'kinematic_ind'],
};
