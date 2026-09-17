/**
 * Aerocabin Charts Controller
 * Handles Chart.js rendering for Certification, LDND, and Lifevest overviews.
 * Dynamically re-renders on theme toggle (Dark / Light) and responsive resize.
 */

const AerocabinCharts = {
    instances: {},

    getThemeColors() {
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        return {
            textColor: isLight ? '#334155' : '#cbd5e1',
            mutedColor: isLight ? '#64748b' : '#94a3b8',
            gridColor: isLight ? 'rgba(15, 23, 42, 0.08)' : 'rgba(148, 163, 184, 0.12)',
            cardBg: isLight ? '#ffffff' : '#131d33'
        };
    },

    destroyChart(key) {
        if (this.instances[key]) {
            this.instances[key].destroy();
            delete this.instances[key];
        }
    },

    destroyAll() {
        Object.keys(this.instances).forEach(k => this.destroyChart(k));
    },

    // 1. Render Certification Charts
    renderCertificationCharts() {
        const data = AerocabinData.certification;
        const theme = this.getThemeColors();

        // Donut: Distribution
        const ctxDist = document.getElementById('certDistributionChart')?.getContext('2d');
        if (ctxDist) {
            this.destroyChart('certDist');
            this.instances['certDist'] = new Chart(ctxDist, {
                type: 'doughnut',
                data: {
                    labels: data.chartDistribution.labels,
                    datasets: [{
                        data: data.chartDistribution.data,
                        backgroundColor: data.chartDistribution.colors,
                        borderWidth: 2,
                        borderColor: theme.cardBg,
                        hoverOffset: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: theme.textColor,
                                font: { family: 'Plus Jakarta Sans', size: 12, weight: '600' },
                                padding: 14
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(15, 23, 42, 0.95)',
                            titleFont: { family: 'Plus Jakarta Sans', weight: 'bold' },
                            bodyFont: { family: 'JetBrains Mono' }
                        }
                    },
                    cutout: '72%'
                }
            });
        }

        // Bar: Top Training Modules
        const ctxMod = document.getElementById('certModulesChart')?.getContext('2d');
        if (ctxMod) {
            this.destroyChart('certMod');
            this.instances['certMod'] = new Chart(ctxMod, {
                type: 'bar',
                data: {
                    labels: data.chartModules.labels,
                    datasets: [{
                        label: 'Jumlah Pemegang Sertifikat',
                        data: data.chartModules.data,
                        backgroundColor: 'rgba(56, 189, 248, 0.75)',
                        borderColor: '#38bdf8',
                        borderWidth: 1.5,
                        borderRadius: 6,
                        hoverBackgroundColor: '#38bdf8'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: 'rgba(15, 23, 42, 0.95)',
                            bodyFont: { family: 'JetBrains Mono' }
                        }
                    },
                    scales: {
                        x: {
                            ticks: { color: theme.mutedColor, font: { family: 'Plus Jakarta Sans', size: 11 } },
                            grid: { display: false }
                        },
                        y: {
                            ticks: { color: theme.mutedColor, font: { family: 'JetBrains Mono', size: 11 } },
                            grid: { color: theme.gridColor }
                        }
                    }
                }
            });
        }
    },

    // 2. Render LDND Carpet Charts
    renderLdndCharts() {
        const data = AerocabinData.ldnd;
        const theme = this.getThemeColors();

        // Donut: Carpet Status
        const ctxDist = document.getElementById('ldndDistributionChart')?.getContext('2d');
        if (ctxDist) {
            this.destroyChart('ldndDist');
            this.instances['ldndDist'] = new Chart(ctxDist, {
                type: 'doughnut',
                data: {
                    labels: data.chartDistribution.labels,
                    datasets: [{
                        data: data.chartDistribution.data,
                        backgroundColor: data.chartDistribution.colors,
                        borderWidth: 2,
                        borderColor: theme.cardBg,
                        hoverOffset: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { color: theme.textColor, font: { family: 'Plus Jakarta Sans', size: 12, weight: '600' }, padding: 14 }
                        }
                    },
                    cutout: '72%'
                }
            });
        }

        // Stacked Bar: Carpet per Fleet
        const ctxFleet = document.getElementById('ldndFleetChart')?.getContext('2d');
        if (ctxFleet) {
            this.destroyChart('ldndFleet');
            this.instances['ldndFleet'] = new Chart(ctxFleet, {
                type: 'bar',
                data: {
                    labels: data.chartFleet.labels,
                    datasets: [
                        {
                            label: 'Already Due',
                            data: data.chartFleet.alreadyDue,
                            backgroundColor: 'rgba(244, 63, 94, 0.85)',
                            borderRadius: 4
                        },
                        {
                            label: 'Near Due (≤14d)',
                            data: data.chartFleet.nearDue,
                            backgroundColor: 'rgba(245, 158, 11, 0.85)',
                            borderRadius: 4
                        },
                        {
                            label: 'Safe',
                            data: data.chartFleet.safe,
                            backgroundColor: 'rgba(16, 185, 129, 0.75)',
                            borderRadius: 4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: { color: theme.textColor, font: { family: 'Plus Jakarta Sans', size: 11, weight: '600' } }
                        }
                    },
                    scales: {
                        x: {
                            stacked: true,
                            ticks: { color: theme.mutedColor, font: { family: 'Plus Jakarta Sans', size: 11 } },
                            grid: { display: false }
                        },
                        y: {
                            stacked: true,
                            ticks: { color: theme.mutedColor, font: { family: 'JetBrains Mono', size: 11 } },
                            grid: { color: theme.gridColor }
                        }
                    }
                }
            });
        }
    },

    // 3. Render Lifevest Charts
    renderLifevestCharts() {
        const data = AerocabinData.lifevest;
        const theme = this.getThemeColors();

        // Donut: Safety Health Status
        const ctxDist = document.getElementById('lifevestDistributionChart')?.getContext('2d');
        if (ctxDist) {
            this.destroyChart('lifevestDist');
            this.instances['lifevestDist'] = new Chart(ctxDist, {
                type: 'doughnut',
                data: {
                    labels: data.chartDistribution.labels,
                    datasets: [{
                        data: data.chartDistribution.data,
                        backgroundColor: data.chartDistribution.colors,
                        borderWidth: 2,
                        borderColor: theme.cardBg,
                        hoverOffset: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { color: theme.textColor, font: { family: 'Plus Jakarta Sans', size: 12, weight: '600' }, padding: 14 }
                        }
                    },
                    cutout: '72%'
                }
            });
        }

        // Pie: Part Numbers
        const ctxPn = document.getElementById('lifevestPnChart')?.getContext('2d');
        if (ctxPn) {
            this.destroyChart('lifevestPn');
            this.instances['lifevestPn'] = new Chart(ctxPn, {
                type: 'pie',
                data: {
                    labels: data.chartPartNumbers.labels,
                    datasets: [{
                        data: data.chartPartNumbers.data,
                        backgroundColor: data.chartPartNumbers.colors,
                        borderWidth: 2,
                        borderColor: theme.cardBg
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { color: theme.textColor, font: { family: 'Plus Jakarta Sans', size: 12, weight: '600' }, padding: 14 }
                        }
                    }
                }
            });
        }
    },

    // 4. Render Global Comparison Chart
    renderGlobalCharts() {
        const theme = this.getThemeColors();
        const ctxHealth = document.getElementById('globalHealthChart')?.getContext('2d');
        if (ctxHealth) {
            this.destroyChart('globalHealth');
            this.instances['globalHealth'] = new Chart(ctxHealth, {
                type: 'bar',
                data: {
                    labels: ['Certification (LCU)', 'LDND Carpet', 'Life Vest Tracker'],
                    datasets: [
                        {
                            label: 'Kepatuhan / Safe Health (%)',
                            data: [91.4, 78.0, 94.2],
                            backgroundColor: ['#38bdf8', '#10b981', '#06b6d4'],
                            borderRadius: 8,
                            barThickness: 36
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: (ctx) => ` Indeks Kesehatan: ${ctx.parsed.y}%`
                            }
                        }
                    },
                    scales: {
                        x: {
                            ticks: { color: theme.textColor, font: { family: 'Plus Jakarta Sans', size: 12, weight: '600' } },
                            grid: { display: false }
                        },
                        y: {
                            min: 0,
                            max: 100,
                            ticks: {
                                color: theme.mutedColor,
                                font: { family: 'JetBrains Mono', size: 11 },
                                callback: val => `${val}%`
                            },
                            grid: { color: theme.gridColor }
                        }
                    }
                }
            });
        }
    },

    // Handle Theme Change
    updateTheme() {
        const activeTab = window.AerocabinApp?.currentTab || 'global';
        if (activeTab === 'global') this.renderGlobalCharts();
        else if (activeTab === 'certification') this.renderCertificationCharts();
        else if (activeTab === 'ldnd') this.renderLdndCharts();
        else if (activeTab === 'lifevest') this.renderLifevestCharts();
    }
};

window.AerocabinCharts = AerocabinCharts;
