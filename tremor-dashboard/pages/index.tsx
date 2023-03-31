import { useState, useEffect, SetStateAction } from 'react';
import {
  Card,
  Metric,
  Title,
  Text,
  Grid,
  BarChart,
  BarList,
  Icon,
  Flex,
  TextInput,
  Bold
} from '@tremor/react';

import Head from 'next/head'

import {
  CircleStackIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/solid'

const TINYBIRD_HOST = process.env.NEXT_PUBLIC_TINYBIRD_HOST;
const TINYBIRD_TOKEN = process.env.NEXT_PUBLIC_TINYBIRD_TOKEN;

export default function Dashboard() {
  
  const [hourParam, setHourParam] = useState('1');
  const gameParam = 0
  
  const [topGames, setTopGames] = useState([]);
  const [totalBets, setTotalBets] = useState([{
    "n_bets": 0,
    "total_amount": 0
  }]);
  const [betsPerMin, setBetsPerMin] = useState([]);

  const handleHourParamChange = (event: { target: { value: SetStateAction<string>; }; }) => {
    setHourParam(Number.isInteger(Number(event.target.value)) ? event.target.value : '1')
  }
  
  let apiTopGames = `https://${TINYBIRD_HOST}/v0/pipes/top_games.json?token=${TINYBIRD_TOKEN}&hour_param=${hourParam}&game_param=${gameParam}`;
  let apiTotalBets = `https://${TINYBIRD_HOST}/v0/pipes/total_bets.json?token=${TINYBIRD_TOKEN}&hour_param=${hourParam}&game_param=${gameParam}`;
  let apiBetsPerMin = `https://${TINYBIRD_HOST}/v0/pipes/bets_per_min.json?token=${TINYBIRD_TOKEN}&hour_param=${hourParam}&game_param=${gameParam}`;

  const fetchTinybirdUrl = async (fetchUrl: string, setState: Function) => {
    console.log(fetchUrl);
    const data = await fetch(fetchUrl)
    const jsonData = await data.json();
    setState(jsonData.data);
  }

  useEffect(() => {
    fetchTinybirdUrl(apiTopGames, setTopGames)
  }, [apiTopGames]);

  useEffect(() => {
    fetchTinybirdUrl(apiTotalBets, setTotalBets)
  }, [apiTotalBets]);

  useEffect(() => {
    fetchTinybirdUrl(apiBetsPerMin, setBetsPerMin)
  }, [apiBetsPerMin]);
  
  const dollarDataFormatter = (number: number) => {
    return "$ " + Intl.NumberFormat("us").format(number).toString();
  };

  const numberDataFormatter = (number: number) => {
    return Intl.NumberFormat("us").format(number).toString();
  };
  
  return (
      <>
      <Head>
        <title>Live Casino Bets</title>
        <meta name="description" content="Live Casino Bets" />
      </Head>
      
      <main className="bg-slate-50 p-6 sm:p-10">
          
          <Metric>Live Casino Bets</Metric>

          <div className="mt-4">
            <Text><Bold>Hours Interval</Bold></Text>
            <TextInput
              placeholder="Enter hours to go back"
              onChange={handleHourParamChange}
              className="max-w-xs mt-2"
            />
          </div>

          <Grid numColsMd={ 3 } className="mt-6 gap-x-6 gap-y-6">
              <Card decoration="top" decorationColor="sky">
                  <Flex justifyContent="start" className="space-x-4">
                      <Icon
                        icon={CircleStackIcon}
                        variant="light"
                        size="xl"
                        color="sky"
                      />
                      <div className="truncate">
                          <Text>Total Bets</Text>
                          <Metric>{totalBets ? Intl.NumberFormat('us').format(totalBets[0].n_bets) : '0'}</Metric>
                      </div>
                  </Flex>
              </Card>
              <Card decoration="top" decorationColor="emerald">
                  <Flex justifyContent="start" className="space-x-4">
                      <Icon
                        icon={CurrencyDollarIcon}
                        variant="light"
                        size="xl"
                        color="emerald"
                      />
                      <div className="truncate">
                          <Text>Total Bets</Text>
                          <Metric>$ {totalBets ? Intl.NumberFormat('us').format(totalBets[0].total_amount) : '0'}</Metric>
                      </div>
                  </Flex>
              </Card>
              <div></div>
              <Card>
                  <Title>Number of Bets Per Minute</Title>
                  <BarChart 
                    data={betsPerMin}
                    categories={["n_bets"]}
                    index="ts"
                    colors={["sky"]}
                    valueFormatter={numberDataFormatter}
                    yAxisWidth={20}
                    className="mt-0"
                  />
              </Card>
              <Card>
                  <Title>Bet Amount Per Minute</Title>
                  <BarChart
                    data={betsPerMin}
                    categories={["amount"]}
                    index="ts"
                    colors={["emerald"]}
                    valueFormatter={dollarDataFormatter}
                    yAxisWidth={20}
                    className="mt-0"
                  />
              </Card>
              <Card>
                  <Title>Top Games By Number of Bets</Title>
                  <BarList 
                    data={topGames}
                    valueFormatter={numberDataFormatter}
                    color="sky" 
                    className="mt-4"
                  />
              </Card>
          </Grid>
          
      </main>

      </>
  );
}