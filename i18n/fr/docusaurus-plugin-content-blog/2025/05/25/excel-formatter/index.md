---
slug: excel-formatter
title: Excel Formula Beautifier
date: 2025-05-25
description: Rendez vos formules Excel complexes faciles à lire ! Utilisez l'Excel Formula Beautifier pour formater et clarifier instantanément les formules de vos feuilles de calcul.
authors: [christophe]
image: /img/v2/excel.webp
series: Self-host your own services
mainTag: excel
tags:
  - excel
  - self-hosted
language: fr
review_date: 2026-07-30
blueskyRecordKey: 3lun2qjuxc22r
---
![Excel Formula Beautifier](/img/v2/excel.webp)

<TLDR>
Vous peinez à lire et à déboguer de longues formules Excel complexes ? Cet article présente l'« Excel Formula Beautifier », un petit outil web qui transforme instantanément vos formules alambiquées en un format propre, indenté et facile à comprendre. Collez votre formule, cliquez sur un bouton, et la logique apparaît clairement, ce qui facilite grandement l'analyse et le dépannage.
</TLDR>

Pouvez-vous lire `=IF(AND(A1<100,B1<>"",ISNUMBER(SEARCH("abc",C1))),TEXT(D1,"dd-mm-yyyy")&" - "&ROUND(E1/F1,2),"N/A")` sans vous dire : ok, prenons quelques secondes pour analyser la formule et comprendre ce qu'elle fait ? Moi, non : je dois m'arrêter un moment et prendre le temps de lire avant de comprendre.

Il y a des années, pour le plaisir, j'ai créé [https://excel-formatter.avonture.be/](https://excel-formatter.avonture.be/). Il rejoint la petite famille d'outils de formatage auto-hébergés que j'ai construits au fil du temps, comme mon <Link to="/blog/sql-formatter">SQL Formatter</Link>.

Découvrons-le.

<!-- truncate -->

## Comment l'utiliser {#how-to-use}

Une image vaut mille mots...

<BrowserWindow url="https://excel-formatter.avonture.be/">
  <img
    alt="Demo"
    src={require("./images/demo.gif").default}
  />
</BrowserWindow>

Copiez/collez donc simplement votre longue formule dans la première zone de texte et cliquez sur le bouton Beautify.

<AlertBox variant="info">
Le script va essayer de déterminer si le séparateur utilisé est `,` ou `;` et, en cas de souci, il suffit d'indiquer le bon.

</AlertBox>

Vous obtiendrez ce type de résultat :

```none
=IF(
    AND(
        A1 < 100;
        B1 <> "";
        ISNUMBER(
            SEARCH(
                "abc";
                C1
            )
        )
    );
    TEXT(
        D1;
        "dd-mm-yyyy"
    ) & " - " &
    ROUND(
        E1 / F1;
        2
    );
    "N/A"
)
```

C'est plus clair, non ? Sinon, voici la transcription :

Si :

- `A1` est inférieur à `100`,
- `B1` n'est pas vide et
- `C1` contient `abc`,

Alors :

`D1` sera formaté comme une date européenne, suivie d'un ratio arrondi de `E1`/`F1`.

Sinon :

Renvoie `N/A`.
