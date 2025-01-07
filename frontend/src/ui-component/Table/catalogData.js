// Threats regarding back-end servers related to vehicles in the field
export const backendServerThreats = {
    "ID": "4.3.1.",
    "description": "Threats regarding back-end servers related to vehicles in the field",
    "threats": {
      "server_abuse": {
        "description": "Back-end servers used as a means to attack a vehicle or extract data",
        "sub_threats": {
          "1": "Abuse of privileges by staff (insider attack)",
          "2": "Unauthorized internet access to the server (enabled by backdoors, unpatched system software vulnerabilities, SQL attacks or other means)",
          "3": "Unauthorized physical access to the server (e.g., USB sticks or other media connecting to the server)"
        }
      },
      "service_disruption": {
        "description": "Services from back-end server being disrupted, affecting the operation of a vehicle",
        "sub_threats": {
          "1": "Attack on back-end server stops it functioning, preventing it from interacting with vehicles and providing services"
        }
      },
      "data_breach": {
        "description": "Vehicle related data held on back-end servers being lost or compromised ('data breach')",
        "sub_threats": {
          "1": "Abuse of privileges by staff (insider attack)",
          "2": "Loss of information in the cloud due to attacks or accidents when data is stored by third-party cloud service providers",
          "3": "Unauthorized internet access to the server",
          "4": "Unauthorized physical access to the server",
          "5": "Information breach by unintended sharing of data (e.g., admin errors)"
        }
      }
    }
  };
  
  // Vehicle Communication Threats
  export const vehicleCommunicationThreats = {
    "ID": "4.3.2.",
    "description": "Threats to vehicles regarding their communication channels",
    "threats": {
      "message_spoofing": {
        "description": "Spoofing of messages or data received by the vehicle",
        "sub_threats": {
          "1": "Spoofing of messages by impersonation (e.g., 802.11p V2X during platooning, GNSS messages)",
          "2": "Sybil attack (to spoof other vehicles as if there are many vehicles on the road)"
        }
      },
      "data_manipulation": {
        "description": "Communication channels used to conduct unauthorized manipulation, deletion or amendments to vehicle held code/data",
        "sub_threats": {
          "1": "Communications channels permit code injection",
          "2": "Communications channels permit manipulation of vehicle held data/code",
          "3": "Communications channels permit overwrite of vehicle held data/code",
          "4": "Communications channels permit erasure of vehicle held data/code",
          "5": "Communications channels permit introduction of data/code to the vehicle"
        }
      },
      "untrusted_messages": {
        "description": "Communication channels permit untrusted/unreliable messages to be accepted",
        "sub_threats": {
          "1": "Accepting information from an unreliable or untrusted source",
          "2": "Man in the middle attack/session hijacking",
          "3": "Replay attack"
        }
      },
      "information_disclosure": {
        "description": "Information can be readily disclosed",
        "sub_threats": {
          "1": "Interception of information/interfering radiations/monitoring communications",
          "2": "Gaining unauthorized access to files or data"
        }
      },
      "denial_of_service": {
        "description": "Denial of service attacks via communication channels to disrupt vehicle functions",
        "sub_threats": {
          "1": "Sending a large number of garbage data to vehicle information system",
          "2": "Black hole attack"
        }
      },
      "privilege_escalation": {
        "description": "An unprivileged user is able to gain privileged access to vehicle systems",
        "sub_threats": {
          "1": "An unprivileged user is able to gain privileged access"
        }
      },
      "malware": {
        "description": "Viruses embedded in communication media are able to infect vehicle systems",
        "sub_threats": {
          "1": "Virus embedded in communication media infects vehicle systems"
        }
      },
      "malicious_internal_messages": {
        "description": "Messages received or transmitted within the vehicle contain malicious content",
        "sub_threats": {
          "1": "Malicious internal messages (e.g., CAN)",
          "2": "Malicious V2X messages",
          "3": "Malicious diagnostic messages",
          "4": "Malicious proprietary messages"
        }
      }
    }
  };
  
  // Threats related to update procedures
  export const updateProceduresThreats = {
    "ID": "4.3.3.",
    "description": "Threats to vehicles regarding their update procedures",
    "threats": {
      "update_compromise": {
        "description": "Misuse or compromise of update procedures",
        "sub_threats": {
          "1": "Compromise of over-the-air software update procedures",
          "2": "Compromise of local/physical software update procedures",
          "3": "Software is manipulated before the update process",
          "4": "Compromise of cryptographic keys of the software provider"
        }
      },
      "update_denial": {
        "description": "It is possible to deny legitimate updates",
        "sub_threats": {
          "1": "Denial of Service attack against update server"
        }
      }
    }
  };
  
  // Unintended human actions threats
  export const unintendedHumanActionsThreats = {
    "ID": "4.3.4.",
    "description": "Threats to vehicles regarding unintended human actions facilitating a cyber attack",
    "threats": {
      "human_error": {
        "description": "Legitimate actors are able to take actions that would unwittingly facilitate a cyberattack",
        "sub_threats": {
          "1": "Innocent victim being tricked into taking an action to unintentionally load malware",
          "2": "Defined security procedures are not followed"
        }
      }
    }
  };
  
  // External connectivity threats
  export const externalConnectivityThreats = {
    "ID": "4.3.5.",
    "description": "Threats to vehicles regarding their external connectivity and connections",
    "threats": {
      "remote_access_threats": {
        "description": "Manipulation of the connectivity of vehicle functions enables a cyberattack",
        "sub_threats": {
          "1": "Manipulation of functions designed to remotely operate systems",
          "2": "Manipulation of vehicle telematics",
          "3": "Interference with short-range wireless systems or sensors"
        }
      },
      "third_party_software": {
        "description": "Hosted 3rd party software used as a means to attack vehicle systems",
        "sub_threats": {
          "1": "Corrupted applications used as a method to attack vehicle systems"
        }
      },
      "external_device_threats": {
        "description": "Devices connected to external interfaces used as a means to attack vehicle systems",
        "sub_threats": {
          "1": "External interfaces such as USB or other ports used as a point of attack",
          "2": "Media infected with a virus connected to a vehicle system",
          "3": "Diagnostic access used to facilitate an attack"
        }
      }
    }
  };
  
  // Vehicle data threats
  export const vehicleDataThreats = {
    "ID": "4.3.6.",
    "description": "Threats to vehicle data/code",
    "threats": {
      "data_extraction": {
        "description": "Extraction of vehicle data/code",
        "sub_threats": {
          "1": "Extraction of copyright or proprietary software from vehicle systems",
          "2": "Unauthorized access to the owner’s privacy information",
          "3": "Extraction of cryptographic keys"
        }
      },
      "data_manipulation": {
        "description": "Manipulation of vehicle data/code",
        "sub_threats": {
          "1": "Illegal changes to vehicle’s electronic ID",
          "2": "Identity fraud",
          "3": "Circumventing monitoring systems",
          "4": "Data manipulation to falsify vehicle’s driving data",
          "5": "Unauthorized changes to system diagnostic data"
        }
      },
      "data_erase": {
        "description": "Erasure of data/code",
        "sub_threats": {
          "1": "Unauthorized deletion/manipulation of system event logs"
        }
      },
      "malware_introduction": {
        "description": "Introduction of malware",
        "sub_threats": {
          "1": "Introduce malicious software or malicious software activity"
        }
      },
      "software_fabrication": {
        "description": "Introduction of new software or overwrite existing software",
        "sub_threats": {
          "1": "Fabrication of software of the vehicle control system"
        }
      },
      "system_disruption": {
        "description": "Disruption of systems or operations",
        "sub_threats": {
          "1": "Denial of service"
        }
      },
      "parameter_manipulation": {
        "description": "Manipulation of vehicle parameters",
        "sub_threats": {
          "1": "Unauthorized access or falsify configuration parameters of vehicle’s key functions",
          "2": "Unauthorized access or falsify charging parameters"
        }
      }
    }
  };
  
  // Vulnerability exploitation threats
  export const vulnerabilityExploitationThreats = {
    "ID": "4.3.7.",
    "description": "Potential vulnerabilities that could be exploited if not sufficiently protected or hardened",
    "threats": {
      "cryptographic_weaknesses": {
        "description": "Cryptographic technologies can be compromised or insufficiently applied",
        "sub_threats": {
          "1": "Combination of short encryption keys and long period of validity enables attacker to break encryption",
          "2": "Insufficient use of cryptographic algorithms to protect sensitive systems",
          "3": "Using deprecated cryptographic algorithms"
        }
      },
      "compromised_parts": {
        "description": "Parts or supplies could be compromised to permit vehicles to be attacked",
        "sub_threats": {
          "1": "Hardware or software engineered to enable an attack"
        }
      },
      "development_vulnerabilities": {
        "description": "Software or hardware development permits vulnerabilities",
        "sub_threats": {
          "1": "Software bugs",
          "2": "Using remainders from development"
        }
      },
      "network_vulnerabilities": {
        "description": "Network design introduces vulnerabilities",
        "sub_threats": {
          "1": "Superfluous internet ports left open",
          "2": "Circumvent network separation to gain control"
        }
      },
      "unintended_data_transfer": {
        "description": "Unintended transfer of data can occur",
        "sub_threats": {
          "1": "Information breach when the car changes user"
        }
      },
      "physical_manipulation": {
        "description": "Physical manipulation of systems can enable an attack",
        "sub_threats": {
          "1": "Manipulation of electronic hardware"
        }
      }
    }
  };
  