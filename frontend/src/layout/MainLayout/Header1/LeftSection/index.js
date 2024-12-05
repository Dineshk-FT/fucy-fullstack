/* eslint-disable */
import React, { useState, useEffect } from "react";
import {
  Box,
  Tooltip,
  Typography,
  IconButton,
} from "@mui/material";
import {
  Add as AddIcon,
  FolderOpen as OpenIcon,
  Delete as DeleteIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  ContentCut as CutIcon,
  ContentCopy as CopyIcon,
  ContentPaste as PasteIcon,
  SelectAll as SelectAllIcon,
  DeselectOutlined as DeselectIcon,
  Image as ImageIcon,
  TableChart as TableIcon,
  Link as LinkIcon,
  Edit as RenameIcon,
} from "@mui/icons-material";
import TemplateList from "../../../../views/Libraries"; 
import Components from "../../../../views/NodeList";
import SelectProject from "../../../../ui-component/Modal/SelectProject";
import AddModel from "../../../../ui-component/Modal/AddModal";
import RenameProject from "../../../../ui-component/Modal/RenameModal";
import DeleteProject from "../../../../ui-component/Modal/DeleteProjects";
import useStore from "../../../../Zustand/store";
import ColorTheme from '../../../../store/ColorTheme';

const LeftSection = () => {
  const selector = (state) => ({
    Models: state.Models,
    getModels: state.getModels,
    deleteModels: state.deleteModels,
    getSidebarNode: state.getSidebarNode,
    getTemplates: state.getTemplates,
  });
  const color = ColorTheme();
  const { Models, getModels, deleteModels, getSidebarNode, getTemplates } =
    useStore(selector);

  const [activeTab, setActiveTab] = useState("Project");
  const [openModal, setOpenModal] = useState({
    New: false,
    Rename: false,
    Open: false,
    Delete: false,
  });

  useEffect(() => {
    getSidebarNode();
    getTemplates();
  }, []);

  const tabs = [
    {
      name: "Project",
      options: [
        { label: "New", icon: AddIcon, action: () => setOpenModal({ ...openModal, New: true }) },
        { label: "Rename", icon: RenameIcon, action: () => setOpenModal({ ...openModal, Rename: true }) },
        { label: "Open", icon: OpenIcon, action: () => setOpenModal({ ...openModal, Open: true }) },
        { label: "Delete", icon: DeleteIcon, action: () => setOpenModal({ ...openModal, Delete: true }) },
        { label: "Undo", icon: UndoIcon, action: () => console.log("Undo") },
        { label: "Redo", icon: RedoIcon, action: () => console.log("Redo") },
        { label: "Cut", icon: CutIcon, action: () => console.log("Cut") },
        { label: "Copy", icon: CopyIcon, action: () => console.log("Copy") },
        { label: "Paste", icon: PasteIcon, action: () => console.log("Paste") },
        { label: "Select All", icon: SelectAllIcon, action: () => console.log("Select All") },
        { label: "Deselect All", icon: DeselectIcon, action: () => console.log("Deselect All") },
      ],
    },
    {
      name: "Insert",
      options: [
        { label: "Image", icon: ImageIcon, action: () => console.log("Insert Image") },
        { label: "Table", icon: TableIcon, action: () => console.log("Insert Table") },
        { label: "Link", icon: LinkIcon, action: () => console.log("Insert Link") },
      ],
    },
    {
      name: "System",
      options: [
        {
          subLevel: <TemplateList /> 
        },
      ],
    },
    {
      name: "Components",
      options: [
        {
          subLevel: <Components /> 
        },
      ],
    },
  ];

  const handleCloseNewModal = () => {
    setOpenModal((prev) => ({ ...prev, New: false }));
  };

  const handleCloseOpenModal = () => {
    setOpenModal((prev) => ({ ...prev, Open: false }));
  };

  const handleCloseDeleteModal = () => {
    setOpenModal((prev) => ({ ...prev, Delete: false }));
  };

  const handleCloseRenameModal = () => {
    setOpenModal((prev) => ({ ...prev, Rename: false }));
  };

  return (
    <Box>
      {/* Tabs */}
      <Box
        sx={{
          display: "flex",
          backgroundColor: "transparent",
          padding: "4px",
          paddingTop: "8px",
        }}
      >
        {tabs.map((tab) => (
          <Typography
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            sx={{
              cursor: "pointer",
              fontSize: "12px",
              color: activeTab === tab.name ? "blue" : color.title,
              fontWeight: activeTab === tab.name ? "bold" : "normal",
              margin: "0 8px",
              padding: "2px 4px",
              borderBottom: activeTab === tab.name ? "2px solid blue" : "none",
              paddingBottom: activeTab === tab.name ? "2px" : "0px", 
              "&:hover": { color: "blue" },
            }}
          >
            {tab.name}
          </Typography>
        ))}
      </Box>

      {/* Tab Content */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          padding: "8px",
          borderRadius: "10px",
          backgroundColor: color.canvasBG,
          border: "1px solid #ddd",
        }}
      >
        {tabs
          .find((tab) => tab.name === activeTab)
          ?.options.map((option, index) => {
            const Icon = option.icon;
            return (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  width: activeTab === "System" || activeTab === "Components" ? "auto" : "60px",
                }}
              >
                {/* Only show label and icon for other tabs */}
                {option.label && (
                  <>
                    <Tooltip title={option.label}>
                      <IconButton
                        onClick={option.action}
                        sx={{
                          padding: "6px",
                          fontSize: "12px",
                          color: color.title,
                          backgroundColor: color?.sidebarBG,
                          border: "1px solid #ddd",
                          "&:hover": { backgroundColor: color.sidebarBG },
                        }}
                      >
                        <Icon fontSize="extra-small" />
                      </IconButton>
                    </Tooltip>
                    <Typography
                      sx={{
                        marginTop: "4px",
                        fontSize: "8px",
                        textAlign: "center",
                        color: color.title,
                      }}
                    >
                      {option.label}
                    </Typography>
                  </>
                )}
                {/* Render the subLevel (TemplateList) for the "System" tab */}
                {option.subLevel && (
                  <Box>
                    {option.subLevel}
                  </Box>
                )}
              </Box>
            );
          })}
      </Box>

      {/* Modals */}
      {openModal.New && <AddModel getModels={getModels} open={openModal.New} handleClose={handleCloseNewModal} />}
      {openModal.Rename && (
        <RenameProject open={openModal.Rename} handleClose={handleCloseRenameModal} Models={Models} />
      )}
      {openModal.Open && <SelectProject open={openModal.Open} handleClose={handleCloseOpenModal} Models={Models} />}
      {openModal.Delete && (
        <DeleteProject open={openModal.Delete} handleClose={handleCloseDeleteModal} Models={Models} deleteModels={deleteModels} />
      )}
    </Box>
  );
};

export default LeftSection;