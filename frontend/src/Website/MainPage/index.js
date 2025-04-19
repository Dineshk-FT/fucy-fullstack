import React from 'react';
import MainCanvas from '../../views/MainCanvas';
import Tstable from '../../ui-component/Table/TSTable';
import DsTable from '../../ui-component/Table/DSTable';
import AttackTree from '../../views/AttackTree';
import DsDerivationTable from '../../ui-component/Table/DsDerivationTable';
import AttackTreeTable from '../../ui-component/Table/AttackTreeTable';
import RiskTreatmentTable from '../../ui-component/Table/RiskTreatmentTable';
import CybersecurityTable from '../../ui-component/Table/CyberSecurityTable';
import BackendServerTable from '../../ui-component/Table/BackendServerTable';
import VehiclesCommunicationTable from '../../ui-component/Table/VehiclesCommunicationTable';
import UpdateProcedureTable from '../../ui-component/Table/UpdateProcedureTable';
import HumanActionTable from '../../ui-component/Table/HumanActionTable';
import ExternalConnectivityTable from '../../ui-component/Table/ExternalConnectivityTable';
import SoftwareIntegrityTable from '../../ui-component/Table/SoftwareIntegrityTable';
import PotentialVulnerbilityTable from '../../ui-component/Table/PotentialVulnerabilityTable';
import VulnerabilityTable from '../../ui-component/Table/VulnerabilityTable';
import MitigationsTable from '../../ui-component/Table/MitigationsTable';
import { useSelector } from 'react-redux';
import TsDerivedTable from '../../ui-component/Table/TsDerivedTable';

export default function MainPage() {
  const { tableOpen } = useSelector((state) => state?.currentId);
  const commonTables = ['Cybersecurity Requirements', 'Cybersecurity Controls', 'Cybersecurity Goals', 'Cybersecurity Claims'];
  const componentMap = {
    'Damage Scenarios (DS) Derivations': <DsDerivationTable />,
    'Damage Scenarios - Impact Ratings': <DsTable />,
    'Threat Scenarios': <Tstable />,
    'Derived Threat Scenarios': <TsDerivedTable />,
    Attack: <AttackTreeTable />,
    'Threat Assessment & Risk Treatment': <RiskTreatmentTable />,
    'Attack Trees Canvas': <AttackTree />,
    'Threats - Back-end servers associated with vehicle field operations': <BackendServerTable />,
    'Threats - Vehicle communication channel vulnerabilities': <VehiclesCommunicationTable />,
    'Threats - Vehicle update procedures and their risks': <UpdateProcedureTable />,
    'Threats - Human actions unintentionally enabling cyber attacks on vehicles': <HumanActionTable />,
    'Threats - Vehicles from external connectivity and network connections': <ExternalConnectivityTable />,
    'Threats - Vehicle data and software integrity': <SoftwareIntegrityTable />,
    'Potential vulnerabilities in vehicles if not properly secured or hardened': <PotentialVulnerbilityTable />,
    Vulnerablity: <VulnerabilityTable />,
    Mitigations: <MitigationsTable />,
    ...commonTables.reduce((acc, key) => ({ ...acc, [key]: <CybersecurityTable /> }), {})
  };
  return componentMap[tableOpen] || <MainCanvas />;
}
