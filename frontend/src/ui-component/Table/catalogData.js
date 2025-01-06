// Threats regarding back-end servers related to vehicles in the field
export const backendServerThreats = {
    "description": "Threats regarding back-end servers related to vehicles in the field",
    "threats": {
      "server_abuse": {
        "description": "Back-end servers used as a means to attack a vehicle or extract data",
        "sub_threats": {
          "insider_attack": "Abuse of privileges by staff (insider attack)",
          "unauthorized_internet_access": "Unauthorized internet access to the server (enabled by backdoors, unpatched system software vulnerabilities, SQL attacks or other means)",
          "physical_access": "Unauthorized physical access to the server (e.g., USB sticks or other media connecting to the server)"
        }
      },
      "service_disruption": {
        "description": "Services from back-end server being disrupted, affecting the operation of a vehicle",
        "sub_threats": {
          "server_outage": "Attack on back-end server stops it functioning, preventing it from interacting with vehicles and providing services"
        }
      },
      "data_breach": {
        "description": "Vehicle related data held on back-end servers being lost or compromised ('data breach')",
        "sub_threats": {
          "insider_attack": "Abuse of privileges by staff (insider attack)",
          "cloud_data_loss": "Loss of information in the cloud due to attacks or accidents when data is stored by third-party cloud service providers",
          "unauthorized_internet_access": "Unauthorized internet access to the server",
          "physical_access": "Unauthorized physical access to the server",
          "admin_error": "Information breach by unintended sharing of data (e.g., admin errors)"
        }
      }
    }
  };
  
  // Vehicle Communication Threats
  export const vehicleCommunicationThreats = {
    "description": "Threats to vehicles regarding their communication channels",
    "threats": {
      "message_spoofing": {
        "description": "Spoofing of messages or data received by the vehicle",
        "sub_threats": {
          "message_impersonation": "Spoofing of messages by impersonation (e.g., 802.11p V2X during platooning, GNSS messages)",
          "sybil_attack": "Sybil attack (to spoof other vehicles as if there are many vehicles on the road)"
        }
      },
      "data_manipulation": {
        "description": "Communication channels used to conduct unauthorized manipulation, deletion or amendments to vehicle held code/data",
        "sub_threats": {
          "code_injection": "Communications channels permit code injection",
          "data_manipulation": "Communications channels permit manipulation of vehicle held data/code",
          "data_overwrite": "Communications channels permit overwrite of vehicle held data/code",
          "data_erase": "Communications channels permit erasure of vehicle held data/code",
          "data_introduction": "Communications channels permit introduction of data/code to the vehicle"
        }
      },
      "untrusted_messages": {
        "description": "Communication channels permit untrusted/unreliable messages to be accepted",
        "sub_threats": {
          "untrusted_source": "Accepting information from an unreliable or untrusted source",
          "man_in_the_middle": "Man in the middle attack/session hijacking",
          "replay_attack": "Replay attack"
        }
      },
      "information_disclosure": {
        "description": "Information can be readily disclosed",
        "sub_threats": {
          "interception": "Interception of information/interfering radiations/monitoring communications",
          "unauthorized_access": "Gaining unauthorized access to files or data"
        }
      },
      "denial_of_service": {
        "description": "Denial of service attacks via communication channels to disrupt vehicle functions",
        "sub_threats": {
          "garbage_data": "Sending a large number of garbage data to vehicle information system",
          "blackhole_attack": "Black hole attack"
        }
      },
      "privilege_escalation": {
        "description": "An unprivileged user is able to gain privileged access to vehicle systems",
        "sub_threats": {
          "privilege_gain": "An unprivileged user is able to gain privileged access"
        }
      },
      "malware": {
        "description": "Viruses embedded in communication media are able to infect vehicle systems",
        "sub_threats": {
          "virus_infection": "Virus embedded in communication media infects vehicle systems"
        }
      },
      "malicious_internal_messages": {
        "description": "Messages received or transmitted within the vehicle contain malicious content",
        "sub_threats": {
          "can_malicious": "Malicious internal messages (e.g., CAN)",
          "v2x_malicious": "Malicious V2X messages",
          "diagnostic_malicious": "Malicious diagnostic messages",
          "proprietary_malicious": "Malicious proprietary messages"
        }
      }
    }
  };
  
  // Threats related to update procedures
  export const updateProceduresThreats = {
    "description": "Threats to vehicles regarding their update procedures",
    "threats": {
      "update_compromise": {
        "description": "Misuse or compromise of update procedures",
        "sub_threats": {
          "ota_compromise": "Compromise of over-the-air software update procedures",
          "local_update_compromise": "Compromise of local/physical software update procedures",
          "software_manipulation": "Software is manipulated before the update process",
          "key_compromise": "Compromise of cryptographic keys of the software provider"
        }
      },
      "update_denial": {
        "description": "It is possible to deny legitimate updates",
        "sub_threats": {
          "update_server_dos": "Denial of Service attack against update server"
        }
      }
    }
  };
  
  // Unintended human actions threats
  export const unintendedHumanActionsThreats = {
    "description": "Threats to vehicles regarding unintended human actions facilitating a cyber attack",
    "threats": {
      "human_error": {
        "description": "Legitimate actors are able to take actions that would unwittingly facilitate a cyberattack",
        "sub_threats": {
          "malware_loading": "Innocent victim being tricked into taking an action to unintentionally load malware",
          "security_procedures_not_followed": "Defined security procedures are not followed"
        }
      }
    }
  };
  
  // External connectivity threats
  export const externalConnectivityThreats = {
    "description": "Threats to vehicles regarding their external connectivity and connections",
    "threats": {
      "remote_access_threats": {
        "description": "Manipulation of the connectivity of vehicle functions enables a cyberattack",
        "sub_threats": {
          "remote_control": "Manipulation of functions designed to remotely operate systems",
          "telematics_manipulation": "Manipulation of vehicle telematics",
          "wireless_interference": "Interference with short-range wireless systems or sensors"
        }
      },
      "third_party_software": {
        "description": "Hosted 3rd party software used as a means to attack vehicle systems",
        "sub_threats": {
          "corrupted_apps": "Corrupted applications used as a method to attack vehicle systems"
        }
      },
      "external_device_threats": {
        "description": "Devices connected to external interfaces used as a means to attack vehicle systems",
        "sub_threats": {
          "usb_ports_attack": "External interfaces such as USB or other ports used as a point of attack",
          "infected_media": "Media infected with a virus connected to a vehicle system",
          "diagnostic_access_attack": "Diagnostic access used to facilitate an attack"
        }
      }
    }
  };
  
  // Vehicle data threats
  export const vehicleDataThreats = {
    "description": "Threats to vehicle data/code",
    "threats": {
      "data_extraction": {
        "description": "Extraction of vehicle data/code",
        "sub_threats": {
          "software_extraction": "Extraction of copyright or proprietary software from vehicle systems",
          "privacy_data_access": "Unauthorized access to the owner’s privacy information",
          "key_extraction": "Extraction of cryptographic keys"
        }
      },
      "data_manipulation": {
        "description": "Manipulation of vehicle data/code",
        "sub_threats": {
          "electronic_id_falsification": "Illegal changes to vehicle’s electronic ID",
          "identity_fraud": "Identity fraud",
          "monitoring_systems_bypass": "Circumventing monitoring systems",
          "driving_data_falsification": "Data manipulation to falsify vehicle’s driving data",
          "diagnostic_data_change": "Unauthorized changes to system diagnostic data"
        }
      },
      "data_erase": {
        "description": "Erasure of data/code",
        "sub_threats": {
          "log_deletion": "Unauthorized deletion/manipulation of system event logs"
        }
      },
      "malware_introduction": {
        "description": "Introduction of malware",
        "sub_threats": {
          "malware_injection": "Introduce malicious software or malicious software activity"
        }
      },
      "software_fabrication": {
        "description": "Introduction of new software or overwrite existing software",
        "sub_threats": {
          "software_fabrication": "Fabrication of software of the vehicle control system"
        }
      },
      "system_disruption": {
        "description": "Disruption of systems or operations",
        "sub_threats": {
          "dos_attack": "Denial of service"
        }
      },
      "parameter_manipulation": {
        "description": "Manipulation of vehicle parameters",
        "sub_threats": {
          "function_parameter_falsification": "Unauthorized access or falsify configuration parameters of vehicle’s key functions",
          "charging_parameter_falsification": "Unauthorized access or falsify charging parameters"
        }
      }
    }
  };
  
  // Vulnerability exploitation threats
  export const vulnerabilityExploitationThreats = {
    "description": "Potential vulnerabilities that could be exploited if not sufficiently protected or hardened",
    "threats": {
      "cryptographic_weaknesses": {
        "description": "Cryptographic technologies can be compromised or insufficiently applied",
        "sub_threats": {
          "weak_encryption": "Combination of short encryption keys and long period of validity enables attacker to break encryption",
          "insufficient_encryption": "Insufficient use of cryptographic algorithms to protect sensitive systems",
          "deprecated_encryption": "Using deprecated cryptographic algorithms"
        }
      },
      "compromised_parts": {
        "description": "Parts or supplies could be compromised to permit vehicles to be attacked",
        "sub_threats": {
          "hardware_manipulation": "Hardware or software engineered to enable an attack"
        }
      },
      "development_vulnerabilities": {
        "description": "Software or hardware development permits vulnerabilities",
        "sub_threats": {
          "bugs": "Software bugs",
          "development_leftovers": "Using remainders from development"
        }
      },
      "network_vulnerabilities": {
        "description": "Network design introduces vulnerabilities",
        "sub_threats": {
          "open_ports": "Superfluous internet ports left open",
          "network_circumvention": "Circumvent network separation to gain control"
        }
      },
      "unintended_data_transfer": {
        "description": "Unintended transfer of data can occur",
        "sub_threats": {
          "user_change_breach": "Information breach when the car changes user"
        }
      },
      "physical_manipulation": {
        "description": "Physical manipulation of systems can enable an attack",
        "sub_threats": {
          "hardware_manipulation": "Manipulation of electronic hardware"
        }
      }
    }
  };
  