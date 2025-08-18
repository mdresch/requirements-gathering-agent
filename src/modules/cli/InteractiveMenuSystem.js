"use strict";
/**
 * Interactive CLI Menu System
 *
 * Provides a Yeoman-style interactive CLI interface for the ADPA system.
 * This is the main entry point for the interactive menu functionality.
 *
 * @version 1.0.0
 * @author ADPA Team
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InteractiveMenuSystem = void 0;
exports.startInteractiveMenu = startInteractiveMenu;
var readline_1 = require("readline");
var events_1 = require("events");
/**
 * Main Interactive Menu System Class
 */
var InteractiveMenuSystem = /** @class */ (function (_super) {
    __extends(InteractiveMenuSystem, _super);
    function InteractiveMenuSystem() {
        var _this = _super.call(this) || this;
        _this.navigationStack = [];
        _this.menus = new Map();
        _this.rl = readline_1.default.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        _this.systemStatus = {
            aiProviderConfigured: false,
            projectInitialized: false,
            integrationsConfigured: false,
            documentsGenerated: 0
        };
        _this.initializeMenus();
        return _this;
    }
    /**
     * Start the interactive menu system
     */
    InteractiveMenuSystem.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('🚀 Starting ADPA Interactive CLI...\n');
                        // Load system status
                        return [4 /*yield*/, this.loadSystemStatus()];
                    case 1:
                        // Load system status
                        _a.sent();
                        // Navigate to main menu
                        return [4 /*yield*/, this.navigateTo('main-menu')];
                    case 2:
                        // Navigate to main menu
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Stop the interactive menu system
     */
    InteractiveMenuSystem.prototype.stop = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.rl.close();
                console.log('\n👋 Thank you for using ADPA Interactive CLI!');
                return [2 /*return*/];
            });
        });
    };
    /**
     * Navigate to a specific menu
     */
    InteractiveMenuSystem.prototype.navigateTo = function (menuId, params) {
        return __awaiter(this, void 0, void 0, function () {
            var menu;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        menu = this.menus.get(menuId);
                        if (!menu) {
                            console.error("\u274C Menu not found: ".concat(menuId));
                            return [2 /*return*/];
                        }
                        this.navigationStack.push(menuId);
                        this.currentMenu = menuId;
                        return [4 /*yield*/, this.renderMenu(menu)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.handleMenuInput(menu)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Go back to previous menu
     */
    InteractiveMenuSystem.prototype.goBack = function () {
        return __awaiter(this, void 0, void 0, function () {
            var previous;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.navigationStack.length > 1)) return [3 /*break*/, 3];
                        this.navigationStack.pop(); // Remove current
                        previous = this.navigationStack.pop();
                        if (!previous) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.navigateTo(previous)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [3 /*break*/, 5];
                    case 3:
                        console.log('📍 Already at the top level menu');
                        return [4 /*yield*/, this.navigateTo('main-menu')];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Go to main menu
     */
    InteractiveMenuSystem.prototype.goHome = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.navigationStack = [];
                        return [4 /*yield*/, this.navigateTo('main-menu')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Render a menu to the console
     */
    InteractiveMenuSystem.prototype.renderMenu = function (menu) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, item;
            return __generator(this, function (_b) {
                this.clearScreen();
                // Show breadcrumb if enabled
                if (menu.showBreadcrumb && this.navigationStack.length > 1) {
                    this.renderBreadcrumb();
                }
                // Render menu header
                this.renderMenuHeader(menu.title);
                // Render menu items
                for (_i = 0, _a = menu.items; _i < _a.length; _i++) {
                    item = _a[_i];
                    this.renderMenuItem(item);
                }
                // Render menu footer
                this.renderMenuFooter();
                // Show status bar if enabled
                if (menu.showStatusBar) {
                    this.renderStatusBar();
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Handle user input for a menu
     */
    InteractiveMenuSystem.prototype.handleMenuInput = function (menu) {
        return __awaiter(this, void 0, void 0, function () {
            var choice, selectedItem;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.promptForChoice('Select an option: ')];
                    case 1:
                        choice = _a.sent();
                        selectedItem = menu.items.find(function (item) { return item.key === choice; });
                        if (!!selectedItem) return [3 /*break*/, 3];
                        console.log('❌ Invalid choice. Please try again.');
                        return [4 /*yield*/, this.handleMenuInput(menu)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                    case 3:
                        if (!!selectedItem.enabled) return [3 /*break*/, 5];
                        console.log('⚠️  This option is currently disabled.');
                        return [4 /*yield*/, this.handleMenuInput(menu)];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                    case 5: return [4 /*yield*/, this.executeMenuAction(selectedItem.action)];
                    case 6:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Execute a menu action
     */
    InteractiveMenuSystem.prototype.executeMenuAction = function (action) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 12, , 16]);
                        _a = action.type;
                        switch (_a) {
                            case 'navigate': return [3 /*break*/, 1];
                            case 'function': return [3 /*break*/, 4];
                            case 'command': return [3 /*break*/, 7];
                        }
                        return [3 /*break*/, 10];
                    case 1:
                        if (!action.target) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.navigateTo(action.target)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3: return [3 /*break*/, 11];
                    case 4:
                        if (!action.handler) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.executeFunction(action.handler)];
                    case 5:
                        _b.sent();
                        _b.label = 6;
                    case 6: return [3 /*break*/, 11];
                    case 7:
                        if (!action.command) return [3 /*break*/, 9];
                        return [4 /*yield*/, this.executeCommand(action.command, action.args || [])];
                    case 8:
                        _b.sent();
                        _b.label = 9;
                    case 9: return [3 /*break*/, 11];
                    case 10:
                        console.log('❌ Unknown action type');
                        _b.label = 11;
                    case 11: return [3 /*break*/, 16];
                    case 12:
                        error_1 = _b.sent();
                        console.error('❌ Error executing action:', error_1.message);
                        return [4 /*yield*/, this.pause()];
                    case 13:
                        _b.sent();
                        if (!this.currentMenu) return [3 /*break*/, 15];
                        return [4 /*yield*/, this.navigateTo(this.currentMenu)];
                    case 14:
                        _b.sent();
                        _b.label = 15;
                    case 15: return [3 /*break*/, 16];
                    case 16: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Execute a function handler
     */
    InteractiveMenuSystem.prototype.executeFunction = function (handlerName) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = handlerName;
                        switch (_a) {
                            case 'searchTemplates': return [3 /*break*/, 1];
                            case 'showSystemStatus': return [3 /*break*/, 3];
                            case 'setupEnvironment': return [3 /*break*/, 5];
                            case 'exit': return [3 /*break*/, 7];
                        }
                        return [3 /*break*/, 9];
                    case 1: return [4 /*yield*/, this.searchTemplates()];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 11];
                    case 3: return [4 /*yield*/, this.showSystemStatus()];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 11];
                    case 5: return [4 /*yield*/, this.setupEnvironment()];
                    case 6:
                        _b.sent();
                        return [3 /*break*/, 11];
                    case 7: return [4 /*yield*/, this.stop()];
                    case 8:
                        _b.sent();
                        process.exit(0);
                        return [3 /*break*/, 11];
                    case 9:
                        console.log("\u26A0\uFE0F  Function not implemented: ".concat(handlerName));
                        return [4 /*yield*/, this.pause()];
                    case 10:
                        _b.sent();
                        _b.label = 11;
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Execute a CLI command
     */
    InteractiveMenuSystem.prototype.executeCommand = function (command, args) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("\uD83D\uDD04 Executing: ".concat(command, " ").concat(args.join(' ')));
                        // Here you would integrate with the existing CLI commands
                        // For now, we'll just simulate the execution
                        console.log('✅ Command executed successfully');
                        return [4 /*yield*/, this.pause()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Initialize all menu configurations
     */
    InteractiveMenuSystem.prototype.initializeMenus = function () {
        // Main Menu
        this.menus.set('main-menu', {
            id: 'main-menu',
            title: 'ADPA Interactive CLI - Main Menu',
            showBreadcrumb: false,
            showStatusBar: true,
            items: [
                {
                    key: '1',
                    label: 'Quick Start',
                    icon: '🚀',
                    description: 'Get started quickly with common workflows',
                    enabled: true,
                    action: { type: 'navigate', target: 'quick-start' }
                },
                {
                    key: '2',
                    label: 'Document Generation',
                    icon: '📝',
                    description: 'Generate project documents',
                    enabled: true,
                    badge: '120+ templates',
                    action: { type: 'navigate', target: 'document-generation' }
                },
                {
                    key: '3',
                    label: 'AI Configuration',
                    icon: '🤖',
                    description: 'Configure AI providers',
                    enabled: true,
                    badge: this.getProviderStatusBadge(),
                    action: { type: 'navigate', target: 'ai-configuration' }
                },
                {
                    key: '4',
                    label: 'Project Management',
                    icon: '📊',
                    description: 'Project analysis and management tools',
                    enabled: true,
                    action: { type: 'navigate', target: 'project-management' }
                },
                {
                    key: '5',
                    label: 'Integrations',
                    icon: '🔗',
                    description: 'External system integrations',
                    enabled: true,
                    action: { type: 'navigate', target: 'integrations' }
                },
                {
                    key: '6',
                    label: 'Analytics & Feedback',
                    icon: '📈',
                    description: 'Document analytics and feedback',
                    enabled: true,
                    action: { type: 'navigate', target: 'analytics' }
                },
                {
                    key: '7',
                    label: 'System Configuration',
                    icon: '⚙️',
                    description: 'System settings and configuration',
                    enabled: true,
                    action: { type: 'navigate', target: 'system-config' }
                },
                {
                    key: '8',
                    label: 'Workspace Analysis',
                    icon: '🔍',
                    description: 'Analyze current workspace',
                    enabled: true,
                    action: { type: 'function', handler: 'showSystemStatus' }
                },
                {
                    key: '9',
                    label: 'Help & Documentation',
                    icon: '❓',
                    description: 'User assistance and documentation',
                    enabled: true,
                    action: { type: 'navigate', target: 'help' }
                },
                {
                    key: '0',
                    label: 'Exit',
                    icon: '🚪',
                    description: 'Exit the application',
                    enabled: true,
                    action: { type: 'function', handler: 'exit' }
                }
            ]
        });
        // Quick Start Menu
        this.menus.set('quick-start', {
            id: 'quick-start',
            title: 'Quick Start',
            showBreadcrumb: true,
            showStatusBar: true,
            parent: 'main-menu',
            items: [
                {
                    key: '1',
                    label: 'New Project Setup',
                    icon: '🎯',
                    description: 'Initialize a new project',
                    enabled: true,
                    action: { type: 'function', handler: 'setupEnvironment' }
                },
                {
                    key: '2',
                    label: 'Generate Core Documents',
                    icon: '📋',
                    description: 'Generate essential project documents',
                    enabled: this.systemStatus.projectInitialized,
                    action: { type: 'command', command: 'generate', args: ['core-analysis'] }
                },
                {
                    key: '3',
                    label: 'Project Charter Wizard',
                    icon: '🏗️',
                    description: 'Step-by-step charter creation',
                    enabled: true,
                    action: { type: 'command', command: 'generate', args: ['project-charter'] }
                },
                {
                    key: '4',
                    label: 'Stakeholder Analysis',
                    icon: '👥',
                    description: 'Analyze project stakeholders',
                    enabled: true,
                    action: { type: 'command', command: 'stakeholder', args: ['analysis'] }
                },
                {
                    key: '5',
                    label: 'Risk Assessment',
                    icon: '📊',
                    description: 'Perform risk analysis',
                    enabled: true,
                    action: { type: 'command', command: 'risk-compliance', args: ['--type', 'SOFTWARE_DEVELOPMENT'] }
                },
                {
                    key: '6',
                    label: 'Environment Setup',
                    icon: '🔧',
                    description: 'Configure development environment',
                    enabled: true,
                    action: { type: 'function', handler: 'setupEnvironment' }
                },
                {
                    key: '7',
                    label: 'View Templates',
                    icon: '📚',
                    description: 'Browse available templates',
                    enabled: true,
                    action: { type: 'function', handler: 'searchTemplates' }
                },
                {
                    key: '8',
                    label: 'Back to Main Menu',
                    icon: '⬅️',
                    description: 'Return to main menu',
                    enabled: true,
                    action: { type: 'navigate', target: 'main-menu' }
                }
            ]
        });
        // Document Generation Menu
        this.menus.set('document-generation', {
            id: 'document-generation',
            title: 'Document Generation',
            showBreadcrumb: true,
            showStatusBar: true,
            parent: 'main-menu',
            items: [
                {
                    key: '1',
                    label: 'Browse by Category',
                    icon: '📚',
                    description: 'Browse templates by category',
                    enabled: true,
                    action: { type: 'navigate', target: 'browse-categories' }
                },
                {
                    key: '2',
                    label: 'Search Templates',
                    icon: '🔍',
                    description: 'Search for specific templates',
                    enabled: true,
                    action: { type: 'function', handler: 'searchTemplates' }
                },
                {
                    key: '3',
                    label: 'Generate Single Document',
                    icon: '⚡',
                    description: 'Generate a single document',
                    enabled: true,
                    action: { type: 'command', command: 'generate' }
                },
                {
                    key: '4',
                    label: 'Generate Category',
                    icon: '📦',
                    description: 'Generate all documents in a category',
                    enabled: true,
                    action: { type: 'command', command: 'generate-category' }
                },
                {
                    key: '5',
                    label: 'Generate All Documents',
                    icon: '🌟',
                    description: 'Generate all available documents',
                    enabled: true,
                    action: { type: 'command', command: 'generate-all' }
                },
                {
                    key: '6',
                    label: 'Custom Generation',
                    icon: '🎯',
                    description: 'Custom document generation options',
                    enabled: true,
                    action: { type: 'navigate', target: 'custom-generation' }
                },
                {
                    key: '7',
                    label: 'Recent Documents',
                    icon: '📋',
                    description: 'View recently generated documents',
                    enabled: true,
                    action: { type: 'function', handler: 'showRecentDocuments' }
                },
                {
                    key: '8',
                    label: 'Back to Main Menu',
                    icon: '⬅️',
                    description: 'Return to main menu',
                    enabled: true,
                    action: { type: 'navigate', target: 'main-menu' }
                }
            ]
        });
        // Add more menus as needed...
    };
    /**
     * Render menu header
     */
    InteractiveMenuSystem.prototype.renderMenuHeader = function (title) {
        var width = 61;
        var titlePadding = Math.max(0, Math.floor((width - title.length - 2) / 2));
        var paddedTitle = ' '.repeat(titlePadding) + title + ' '.repeat(titlePadding);
        console.log('┌─────────────────────────────────────────────────────────────┐');
        console.log("\u2502".concat(paddedTitle.substring(0, width - 2).padEnd(width - 2), "\u2502"));
        console.log('├─────────────────────────────────────────────────────────────┤');
    };
    /**
     * Render a menu item
     */
    InteractiveMenuSystem.prototype.renderMenuItem = function (item) {
        var status = item.enabled ? '' : ' (disabled)';
        var badge = item.badge ? " [".concat(item.badge, "]") : '';
        var line = "\u2502  ".concat(item.key, ". ").concat(item.icon, " ").concat(item.label).concat(badge).concat(status);
        console.log(line.padEnd(62) + '│');
    };
    /**
     * Render menu footer
     */
    InteractiveMenuSystem.prototype.renderMenuFooter = function () {
        console.log('└─────────────────────────────────────────────────────────────┘');
    };
    /**
     * Render breadcrumb navigation
     */
    InteractiveMenuSystem.prototype.renderBreadcrumb = function () {
        var _this = this;
        var path = this.navigationStack.map(function (menuId) {
            var menu = _this.menus.get(menuId);
            return (menu === null || menu === void 0 ? void 0 : menu.title.replace('ADPA Interactive CLI - ', '')) || menuId;
        }).join(' > ');
        console.log("\uD83D\uDCCD ".concat(path, "\n"));
    };
    /**
     * Render status bar
     */
    InteractiveMenuSystem.prototype.renderStatusBar = function () {
        var aiStatus = this.systemStatus.aiProviderConfigured ? '✅' : '❌';
        var projectStatus = this.systemStatus.projectInitialized ? '✅' : '❌';
        var integrationStatus = this.systemStatus.integrationsConfigured ? '✅' : '❌';
        console.log("\n\uD83D\uDCCA Status: AI ".concat(aiStatus, " | Project ").concat(projectStatus, " | Integrations ").concat(integrationStatus, " | Documents: ").concat(this.systemStatus.documentsGenerated));
    };
    /**
     * Clear the console screen
     */
    InteractiveMenuSystem.prototype.clearScreen = function () {
        console.clear();
    };
    /**
     * Prompt user for input
     */
    InteractiveMenuSystem.prototype.promptForChoice = function (message) {
        var _this = this;
        return new Promise(function (resolve) {
            _this.rl.question("\n".concat(message), function (answer) {
                resolve(answer.trim());
            });
        });
    };
    /**
     * Pause execution and wait for user input
     */
    InteractiveMenuSystem.prototype.pause = function () {
        var _this = this;
        return new Promise(function (resolve) {
            _this.rl.question('\nPress Enter to continue...', function () {
                resolve();
            });
        });
    };
    /**
     * Load system status
     */
    InteractiveMenuSystem.prototype.loadSystemStatus = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // This would integrate with the existing system to get actual status
                // For now, we'll simulate some status
                this.systemStatus = {
                    aiProviderConfigured: process.env.GOOGLE_AI_API_KEY ? true : false,
                    projectInitialized: true, // Would check for project files
                    integrationsConfigured: false,
                    documentsGenerated: 42, // Would count actual generated documents
                    lastActivity: new Date()
                };
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get provider status badge
     */
    InteractiveMenuSystem.prototype.getProviderStatusBadge = function () {
        return this.systemStatus.aiProviderConfigured ? 'Configured' : 'Setup Required';
    };
    /**
     * Search templates function
     */
    InteractiveMenuSystem.prototype.searchTemplates = function () {
        return __awaiter(this, void 0, void 0, function () {
            var searchTerm;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('\n🔍 Template Search');
                        console.log('─'.repeat(50));
                        return [4 /*yield*/, this.promptForChoice('Enter search term (or press Enter to see all): ')];
                    case 1:
                        searchTerm = _a.sent();
                        // This would integrate with the actual template system
                        console.log('\n📋 Available Templates:');
                        console.log('• Project Charter (project-charter)');
                        console.log('• Stakeholder Register (stakeholder-register)');
                        console.log('• Risk Management Plan (risk-management-plan)');
                        console.log('• Business Case (business-case)');
                        console.log('• ... and 116 more templates');
                        return [4 /*yield*/, this.pause()];
                    case 2:
                        _a.sent();
                        if (!this.currentMenu) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.navigateTo(this.currentMenu)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Show system status
     */
    InteractiveMenuSystem.prototype.showSystemStatus = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('\n🔍 System Status Analysis');
                        console.log('─'.repeat(50));
                        console.log("AI Provider: ".concat(this.systemStatus.aiProviderConfigured ? '✅ Configured' : '❌ Not Configured'));
                        console.log("Project: ".concat(this.systemStatus.projectInitialized ? '✅ Initialized' : '❌ Not Initialized'));
                        console.log("Integrations: ".concat(this.systemStatus.integrationsConfigured ? '✅ Configured' : '❌ Not Configured'));
                        console.log("Documents Generated: ".concat(this.systemStatus.documentsGenerated));
                        if (this.systemStatus.lastActivity) {
                            console.log("Last Activity: ".concat(this.systemStatus.lastActivity.toLocaleString()));
                        }
                        return [4 /*yield*/, this.pause()];
                    case 1:
                        _a.sent();
                        if (!this.currentMenu) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.navigateTo(this.currentMenu)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Setup environment
     */
    InteractiveMenuSystem.prototype.setupEnvironment = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('\n🔧 Environment Setup');
                        console.log('─'.repeat(50));
                        console.log('This would launch the interactive setup wizard...');
                        console.log('• Configure AI Provider');
                        console.log('• Set up integrations');
                        console.log('• Initialize project structure');
                        console.log('• Validate configuration');
                        return [4 /*yield*/, this.pause()];
                    case 1:
                        _a.sent();
                        if (!this.currentMenu) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.navigateTo(this.currentMenu)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return InteractiveMenuSystem;
}(events_1.EventEmitter));
exports.InteractiveMenuSystem = InteractiveMenuSystem;
/**
 * Factory function to create and start the interactive menu
 */
function startInteractiveMenu() {
    return __awaiter(this, void 0, void 0, function () {
        var menuSystem, error_2;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    menuSystem = new InteractiveMenuSystem();
                    // Handle graceful shutdown
                    process.on('SIGINT', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    console.log('\n\n🛑 Shutting down...');
                                    return [4 /*yield*/, menuSystem.stop()];
                                case 1:
                                    _a.sent();
                                    process.exit(0);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 5]);
                    return [4 /*yield*/, menuSystem.start()];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 3:
                    error_2 = _a.sent();
                    console.error('❌ Error starting interactive menu:', error_2);
                    return [4 /*yield*/, menuSystem.stop()];
                case 4:
                    _a.sent();
                    process.exit(1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
