"use client";

import { useEffect, useState } from "react";
import { PromoTileCard } from "./PromoTileCard";

type Tile = { id: string; images: string[]; title: string | null; link: string | null; borderColor: string };

export function PromoTilesSection() {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/promo-tiles")
      .then((r) => r.json())
      .then((data) => {
        setTiles(data);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  if (!loaded || tiles.length === 0) return null;

  return (
    <section className="container-lellahi pt-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {tiles.map((tile) => (
          <PromoTileCard key={tile.id} tile={tile} />
        ))}
      </div>
    </section>
  );
}
