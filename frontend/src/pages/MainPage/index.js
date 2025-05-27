import React from 'react';
import MainCanvas from '../MainCanvas';
import TSTable from '../../components/Table/TSTable';
import DSTable from '../../components/Table/DSTable';
import AttackTree from '../AttackTree';
import DsDerivationTable from '../../components/Table/DsDerivationTable';
import AttackTreeTable from '../../components/Table/AttackTreeTable';
import RiskTreatmentTable from '../../components/Table/RiskTreatmentTable';
import CyberSecurityTable from '../../components/Table/CyberSecurityTable';
import BackendServerTable from '../../components/Table/BackendServerTable';
import VehiclesCommunicationTable from '../../components/Table/VehiclesCommunicationTable';
import UpdateProcedureTable from '../../components/Table/UpdateProcedureTable';
import HumanActionTable from '../../components/Table/HumanActionTable';
import ExternalConnectivityTable from '../../components/Table/ExternalConnectivityTable';
import SoftwareIntegrityTable from '../../components/Table/SoftwareIntegrityTable';
import PotentialVulnerabilityTable from '../../components/Table/PotentialVulnerabilityTable';
import VulnerabilityTable from '../../components/Table/VulnerabilityTable';
import MitigationsTable from '../../components/Table/MitigationsTable';
import { useSelector } from 'react-redux';
import TsDerivedTable from '../../components/Table/TsDerivedTable';

export default function MainPage() {
  const { tableOpen } = useSelector((state) => state?.currentId);
  const commonTables = ['Cybersecurity Requirements', 'Cybersecurity Controls', 'Cybersecurity Goals', 'Cybersecurity Claims'];
  const componentMap = {
    'Damage Scenarios (DS) Derivations': <DsDerivationTable />,
    'Damage Scenarios - Impact Ratings': <DSTable />,
    'Threat Scenarios': <TSTable />,
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
    'Potential vulnerabilities in vehicles if not properly secured or hardened': <PotentialVulnerabilityTable />,
    Vulnerability: <VulnerabilityTable />,
    Mitigations: <MitigationsTable />,
    ...commonTables.reduce((acc, key) => ({ ...acc, [key]: <CyberSecurityTable /> }), {})
  };
  return componentMap[tableOpen] || <MainCanvas />;
}
