import React, { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { equiposRequest } from "../../api/equipos.js";
import styles from "./Home.module.css";

ChartJS.register(ArcElement, Tooltip, Legend);

const Home = () => {
  const [equipos, setEquipos] = useState([]);
  const [dataChart, setDataChart] = useState({
    labels: [],
    datasets: [
      {
        label: "Áreas",
        data: [],
        backgroundColor: ["#3180a5", "#13338a", "#00acfc", "#1b9aaa", "#ffd166"],
        borderWidth: 2,
      },
    ],
  });

  const areaActiva = "Equipos por Área";

  useEffect(() => {
    const fetchEquipos = async () => {
      try {
        const { data } = await equiposRequest();
        setEquipos(data);

        // Agrupar por área
        const conteoAreas = data.reduce((acc, equipo) => {
          const area = equipo.area || "Sin área";
          acc[area] = (acc[area] || 0) + 1;
          return acc;
        }, {});

        // Configurar gráfico
        setDataChart({
          labels: Object.keys(conteoAreas),
          datasets: [
            {
              label: "Equipos por Área",
              data: Object.values(conteoAreas),
              backgroundColor: [
                "#3180a5",
                "#13338a",
                "#00acfc",
                "#1b9aaa",
                "#ffd166",
                "#ef476f",
                "#073b4c",
              ],
              borderWidth: 2,
            },
          ],
        });
      } catch (error) {
        console.error("Error al obtener equipos:", error);
      }
    };

    fetchEquipos();
  }, []);

  const options = {
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        labels: {
          font: { size: 16 },
        },
      },
    },
    cutout: "70%",
  };

  return (
    <main className={styles.main}>
      <h1>Bienvenido a RegiMedical</h1>
      <div className={styles["chart-box"]}>
        <div className={styles["area-chart-container"]}>
          <Doughnut data={dataChart} options={options} />
          <div className={styles["area-label-center"]}>{areaActiva}</div>
        </div>
      </div>
    </main>
  );
};

export default Home;
