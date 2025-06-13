import React from 'react';
import { SimulationParams } from '../types';

interface SavedSettings {
    id: number;
    name: string;
    description: string;
    created_at: string;
    grid_size: number;
    steps: number;
    neighborhood_type: string;
    grid_type: string;
    predator_death_probability: number;
    predator_birth_probability: number;
    initial_predators: number;
    predator_starvation_steps: number;
    prey_hunted_probability: number;
    prey_random_death: number;
    initial_prey: number;
    prey_birth_probability: number;
    prey_starvation_steps: number;
    prey_threat_response: number;
    initial_substrate_probability: number;
    substrate_random_death: number;
    substrate_consumption_prob: number;
}

interface LoadSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoad: (settings: SimulationParams) => void;
    settings: SavedSettings[];
    loading: boolean;
    error: string | null;
}

export default function LoadSettingsModal({ isOpen, onClose, onLoad, settings, loading, error }: LoadSettingsModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Load Settings</h2>

                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                ) : error ? (
                    <div className="text-red-500 text-center py-4">{error}</div>
                ) : settings.length === 0 ? (
                    <div className="text-gray-500 text-center py-4">No saved settings found</div>
                ) : (
                    <div className="overflow-y-auto flex-grow">
                        <div className="space-y-2">
                            {settings.map((setting) => (
                                <div
                                    key={setting.id}
                                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                                    onClick={() => onLoad(setting)}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-medium text-gray-900 dark:text-white">{setting.name}</h3>
                                            {setting.description && (
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                    {setting.description}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {new Date(setting.created_at).toLocaleString()}
                                        </div>
                                    </div>
                                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                        <div>Grid: {setting.grid_size}x{setting.grid_size}</div>
                                        <div>Steps: {setting.steps}</div>
                                        <div>Predators: {setting.initial_predators}</div>
                                        <div>Prey: {setting.initial_prey}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-4 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
} 