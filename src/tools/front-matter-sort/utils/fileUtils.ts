import {TFile, TFolder} from 'obsidian';
import {FrontMatterSortTool} from '../core/FrontMatterSortTool';

/**
 * 检查文件是否应该被忽略
 * @param this 工具实例
 * @param file 要检查的文件
 * @returns 如果文件应该被忽略则返回true
 */
export async function shouldIgnoreFile(this: FrontMatterSortTool, file: TFile): Promise<boolean> {
    const config = this.config;
    const filePath = file.path;
    
    // 检查是否是目录
    if (file instanceof TFolder) {
        return true;
    }
    
    // 检查文件夹匹配
    const ignoredFolders = config.ignoredFolders.split('\n').filter((f: string) => f.trim());
    for (const folderPattern of ignoredFolders) {
        if (matchesPattern(filePath, folderPattern)) {
            return true;
        }
    }
    
    // 检查文件匹配
    const ignoredFiles = config.ignoredFiles.split('\n').filter((f: string) => f.trim());
    for (const filePattern of ignoredFiles) {
        if (matchesPattern(filePath, filePattern)) {
            return true;
        }
    }
    
    return false;
}

/**
 * 检查路径是否匹配给定的模式
 * @param path 要检查的路径
 * @param pattern 匹配模式（支持通配符）
 * @returns 如果匹配则返回true
 */
export function matchesPattern(path: string, pattern: string): boolean {
    // 将通配符转换为正则表达式
    const regexPattern = pattern
        .replace(/[.+?^${}()|[\]\\]/g, '\\$&') // 转义特殊字符
        .replace(/\*/g, '.*') // 将 * 转换为 .*
        .replace(/\?/g, '.'); // 将 ? 转换为 .
    
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(path);
} 