// TeamRecords.tsx
"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { RECORDS_DATA, type TeamId, type CategoryId, type RecordRow } from "../../../lib/recordsData";

interface TeamOption {
    id: TeamId;
    label: string;
}

interface CategoryOption {
    id: CategoryId;
    label: string;
}

const TEAMS: TeamOption[] = [
    { id: "india", label: "India" },
    { id: "srilanka", label: "Sri Lanka" },
];

const CATEGORIES: CategoryOption[] = [
    { id: "most_runs", label: "Most Runs" },
    { id: "most_wickets", label: "Most Wickets" },
    { id: "best_averages", label: "Best Averages" },
    { id: "best_strike_rates", label: "Best Strike Rates" },
    { id: "best_economy_rates", label: "Best Economy Rates" },
];

// Column set + order per category — keeps the table readable instead of
// dumping every raw field from the sheet.
const COLUMNS_BY_CATEGORY: Record<CategoryId, { key: string; label: string }[]> = {
    most_runs: [
        { key: "Player", label: "Player" },
        { key: "Span", label: "Span" },
        { key: "Mat", label: "Mat" },
        { key: "Inns", label: "Inns" },
        { key: "Runs", label: "Runs" },
        { key: "HS", label: "HS" },
        { key: "Ave", label: "Ave" },
        { key: "SR", label: "SR" },
        { key: "100", label: "100" },
        { key: "50", label: "50" },
    ],
    most_wickets: [
        { key: "Player", label: "Player" },
        { key: "Span", label: "Span" },
        { key: "Mat", label: "Mat" },
        { key: "Wkts", label: "Wkts" },
        { key: "BBI", label: "BBI" },
        { key: "Ave", label: "Ave" },
        { key: "Econ", label: "Econ" },
        { key: "SR", label: "SR" },
        { key: "5", label: "5W" },
    ],
    best_averages: [
        { key: "Player", label: "Player" },
        { key: "Span", label: "Span" },
        { key: "Mat", label: "Mat" },
        { key: "Wkts", label: "Wkts" },
        { key: "Ave", label: "Ave" },
        { key: "Econ", label: "Econ" },
        { key: "SR", label: "SR" },
    ],
    best_strike_rates: [
        { key: "Player", label: "Player" },
        { key: "Span", label: "Span" },
        { key: "Mat", label: "Mat" },
        { key: "Wkts", label: "Wkts" },
        { key: "Ave", label: "Ave" },
        { key: "Econ", label: "Econ" },
        { key: "SR", label: "SR" },
    ],
    best_economy_rates: [
        { key: "Player", label: "Player" },
        { key: "Span", label: "Span" },
        { key: "Mat", label: "Mat" },
        { key: "Wkts", label: "Wkts" },
        { key: "Ave", label: "Ave" },
        { key: "Econ", label: "Econ" },
        { key: "SR", label: "SR" },
    ],
};

function formatCell(value: string | number | null): string {
    if (value === null || value === undefined || value === "") return "-";
    return String(value);
}

export default function TeamRecords() {
    const router = useRouter();
    const [selectedTeam, setSelectedTeam] = useState<TeamId>("india");
    const [selectedCategory, setSelectedCategory] = useState<CategoryId>("most_runs");

    const rows: RecordRow[] = useMemo(
        () => RECORDS_DATA[selectedTeam]?.[selectedCategory] ?? [],
        [selectedTeam, selectedCategory]
    );

    const columns = COLUMNS_BY_CATEGORY[selectedCategory];

    const handleBack = () => {
        router.push("/MainModules/HomePage");
    };

    return (
        <div style={{ width: "100%", minHeight: "100%", background: "#0e0e14" }}>
            <div style={{ width: "100%", maxWidth: 960, margin: "0 auto", padding: 16 }}>
                {/* ── Back button ── */}
                <button
                    type="button"
                    onClick={handleBack}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        marginBottom: 16,
                        padding: "6px 10px 6px 6px",
                        borderRadius: 999,
                        border: "1px solid rgba(255,255,255,0.1)",
                        background: "rgba(255,255,255,0.05)",
                        color: "rgba(255,255,255,0.85)",
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                    }}
                >
                    <ChevronLeft size={18} />

                </button>

                <p className="">Test Records</p>
                {/* ── Team selector ── */}
                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>

                    {TEAMS.map((team) => {
                        const isActive = selectedTeam === team.id;
                        return (
                            <button
                                key={team.id}
                                type="button"
                                onClick={() => setSelectedTeam(team.id)}
                                style={{
                                    flex: 1,
                                    padding: "10px 16px",
                                    borderRadius: 10,
                                    fontSize: 14,
                                    fontWeight: 700,
                                    cursor: "pointer",
                                    border: isActive ? "1px solid #E91E8C" : "1px solid rgba(255,255,255,0.1)",
                                    background: isActive
                                        ? "linear-gradient(135deg,#E91E8C,#FF6B35)"
                                        : "rgba(255,255,255,0.05)",
                                    color: isActive ? "#ffffff" : "rgba(255,255,255,0.75)",
                                    transition: "all 0.15s ease",
                                }}
                            >
                                {team.label}
                            </button>
                        );
                    })}
                </div>

                {/* ── Category selector ── */}
                <div
                    style={{
                        display: "flex",
                        gap: 8,
                        marginBottom: 20,
                        overflowX: "auto",
                        paddingBottom: 4,
                    }}
                >
                    {CATEGORIES.map((cat) => {
                        const isActive = selectedCategory === cat.id;
                        return (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => setSelectedCategory(cat.id)}
                                style={{
                                    flexShrink: 0,
                                    padding: "8px 14px",
                                    borderRadius: 999,
                                    fontSize: 12.5,
                                    fontWeight: 700,
                                    whiteSpace: "nowrap",
                                    cursor: "pointer",
                                    border: isActive ? "1px solid #E91E8C" : "1px solid rgba(255,255,255,0.1)",
                                    background: isActive ? "rgba(233,30,140,0.15)" : "rgba(255,255,255,0.05)",
                                    color: isActive ? "#ff8fc4" : "rgba(255,255,255,0.6)",
                                    transition: "all 0.15s ease",
                                }}
                            >
                                {cat.label}
                            </button>
                        );
                    })}
                </div>

                {/* ── Data table ── */}
                <div
                    style={{
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 12,
                        overflow: "hidden",
                        background: "rgba(255,255,255,0.02)",
                    }}
                >
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                            <thead>
                                <tr style={{ background: "rgba(255,255,255,0.05)" }}>
                                    {columns.map((col, i) => (
                                        <th
                                            key={col.key}
                                            style={{
                                                textAlign: i === 0 ? "left" : "right",
                                                padding: "10px 12px",
                                                fontWeight: 700,
                                                fontSize: 11.5,
                                                color: "rgba(255,255,255,0.5)",
                                                textTransform: "uppercase",
                                                letterSpacing: "0.03em",
                                                whiteSpace: "nowrap",
                                                borderBottom: "1px solid rgba(255,255,255,0.08)",
                                            }}
                                        >
                                            {col.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rows.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={columns.length}
                                            style={{ padding: 24, textAlign: "center", color: "rgba(255,255,255,0.35)" }}
                                        >
                                            No records found.
                                        </td>
                                    </tr>
                                ) : (
                                    rows.map((row, idx) => (
                                        <tr
                                            key={`${row.Player}-${idx}`}
                                            style={{
                                                background: idx % 2 === 0 ? "transparent" : "rgba(255,255,255,0.025)",
                                            }}
                                        >
                                            {columns.map((col, i) => (
                                                <td
                                                    key={col.key}
                                                    style={{
                                                        padding: "9px 12px",
                                                        textAlign: i === 0 ? "left" : "right",
                                                        fontWeight: i === 0 ? 600 : 400,
                                                        color: i === 0 ? "#ffffff" : "rgba(255,255,255,0.75)",
                                                        whiteSpace: "nowrap",
                                                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                                                    }}
                                                >
                                                    {formatCell(row[col.key])}
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}