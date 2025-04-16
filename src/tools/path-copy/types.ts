import { ToolConfig } from "../../core/types/types";

/**
 * 路径复制工具的配置类型
 */
export interface PathCopyConfig extends ToolConfig {
    /**
     * 是否在右键菜单中显示绝对路径复制选项
     */
    showAbsolutePathOption: boolean;
    
    /**
     * 是否在右键菜单中显示相对路径复制选项
     */
    showRelativePathOption: boolean;
    
    /**
     * 是否在右键菜单中显示层级结构复制选项
     */
    showHierarchyOption: boolean;
    
    /**
     * 绝对路径复制选项的菜单项标题
     */
    absolutePathMenuTitle: string;
    
    /**
     * 相对路径复制选项的菜单项标题
     */
    relativePathMenuTitle: string;

    /**
     * 层级结构复制选项的菜单项标题
     */
    hierarchyMenuTitle: string;

    /**
     * 多文件路径分隔符
     */
    multiFileSeparator: string;
} 