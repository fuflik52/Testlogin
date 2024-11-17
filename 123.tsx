'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { DollarSign, TrendingUp, Users, Building, Coffee, ShoppingBag, Briefcase, AlertTriangle, Bitcoin, PalmTree, Palette, Car, Helicopter, Home, Tool } from 'lucide-react'
import Image from 'next/image'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

type Business = {
  name: string
  cost: number
  income: number
  icon: React.ReactNode
  health: number
  lastMaintenance: number
}

type Asset = {
  name: string
  cost: number
  icon: React.ReactNode
  owned: number
}

const businesses: Business[] = [
  { name: "Кофейня", cost: 1000, income: 100, icon: <Coffee className="w-6 h-6" />, health: 100, lastMaintenance: 0 },
  { name: "Магазин", cost: 5000, income: 500, icon: <ShoppingBag className="w-6 h-6" />, health: 100, lastMaintenance: 0 },
  { name: "Офис", cost: 20000, income: 2000, icon: <Briefcase className="w-6 h-6" />, health: 100, lastMaintenance: 0 },
  { name: "Нефтезавод", cost: 40000000, income: 5000000, icon: <Building className="w-6 h-6" />, health: 100, lastMaintenance: 0 },
]

const assets: Asset[] = [
  { name: "Остров", cost: 10000000, icon: <PalmTree className="w-6 h-6" />, owned: 0 },
  { name: "Картина", cost: 1000000, icon: <Palette className="w-6 h-6" />, owned: 0 },
  { name: "Машина", cost: 500000, icon: <Car className="w-6 h-6" />, owned: 0 },
  { name: "Вертолет", cost: 5000000, icon: <Helicopter className="w-6 h-6" />, owned: 0 },
  { name: "Дом", cost: 2000000, icon: <Home className="w-6 h-6" />, owned: 0 },
]

export default function Component() {
  const [money, setMoney] = useState(1000)
  const [income, setIncome] = useState(10)
  const [employees, setEmployees] = useState(1)
  const [buildings, setBuildings] = useState(0)
  const [day, setDay] = useState(1)
  const [ownedBusinesses, setOwnedBusinesses] = useState<Record<string, number>>({})
  const [event, setEvent] = useState<string | null>(null)
  const [clickValue, setClickValue] = useState(1)
  const [clickUpgradeCost, setClickUpgradeCost] = useState(100)
  const [cryptoAmount, setCryptoAmount] = useState(0)
  const [cryptoPrice, setCryptoPrice] = useState(100)
  const [cryptoHistory, setCryptoHistory] = useState<{ day: number, price: number }[]>([])
  const [buyAmount, setBuyAmount] = useState('')
  const [sellAmount, setSellAmount] = useState('')
  const [transactionInfo, setTransactionInfo] = useState<string | null>(null)
  const [businessHealth, setBusinessHealth] = useState<Record<string, number>>({})
  const [ownedAssets, setOwnedAssets] = useState<Record<string, number>>({})
  const [bankBalance, setBankBalance] = useState(0)
  const [taxRate, setTaxRate] = useState(10)
  const [nextTaxPayment, setNextTaxPayment] = useState(0)
  const [nextTaxDay, setNextTaxDay] = useState(10)

  const updateCryptoPrice = useCallback(() => {
    const change = (Math.random() - 0.5) * 10
    setCryptoPrice(prevPrice => {
      const newPrice = Math.max(1, prevPrice + change)
      setCryptoHistory(prev => [...prev, { day, price: newPrice }].slice(-30))
      return newPrice
    })
  }, [day])

  useEffect(() => {
    const timer = setInterval(() => {
      setMoney(prevMoney => prevMoney + income)
      setDay(prevDay => prevDay + 1)
      if (Math.random() < 0.1) {
        generateRandomEvent()
      }
      updateCryptoPrice()
      updateBusinessHealth()
      calculateTaxes()
    }, 1000)

    return () => clearInterval(timer)
  }, [income, updateCryptoPrice])

  const handleClick = () => {
    setMoney(prevMoney => prevMoney + clickValue)
  }

  const upgradeClick = () => {
    if (money >= clickUpgradeCost) {
      setMoney(prevMoney => prevMoney - clickUpgradeCost)
      setClickValue(prevValue => prevValue * 2)
      setClickUpgradeCost(prevCost => prevCost * 3)
    }
  }

  const hireEmployee = () => {
    if (money >= 100) {
      setMoney(prevMoney => prevMoney - 100)
      setEmployees(prevEmployees => prevEmployees + 1)
      setIncome(prevIncome => prevIncome + 5)
    }
  }

  const buyBuilding = () => {
    if (money >= 500) {
      setMoney(prevMoney => prevMoney - 500)
      setBuildings(prevBuildings => prevBuildings + 1)
      setIncome(prevIncome => prevIncome + 50)
    }
  }

  const buyBusiness = (business: Business) => {
    if (money >= business.cost) {
      setMoney(prevMoney => prevMoney - business.cost)
      setOwnedBusinesses(prev => ({
        ...prev,
        [business.name]: (prev[business.name] || 0) + 1
      }))
      setIncome(prevIncome => prevIncome + business.income)
      setBusinessHealth(prev => ({
        ...prev,
        [business.name]: 100
      }))
    }
  }

  const buyAsset = (asset: Asset) => {
    if (money >= asset.cost) {
      setMoney(prevMoney => prevMoney - asset.cost)
      setOwnedAssets(prev => ({
        ...prev,
        [asset.name]: (prev[asset.name] || 0) + 1
      }))
    }
  }

  const generateRandomEvent = () => {
    const events = [
      "Экономический бум! Доход увеличен на 20% на день.",
      "Забастовка работников. Доход уменьшен на 10% на день.",
      "Новый инвестор! Получено $1000.",
      "Проверка налоговой. Заплатите $500.",
    ]
    const randomEvent = events[Math.floor(Math.random() * events.length)]
    setEvent(randomEvent)

    if (randomEvent.includes("Экономический бум")) {
      setIncome(prevIncome => Math.floor(prevIncome * 1.2))
    } else if (randomEvent.includes("Забастовка")) {
      setIncome(prevIncome => Math.floor(prevIncome * 0.9))
    } else if (randomEvent.includes("Новый инвестор")) {
      setMoney(prevMoney => prevMoney + 1000)
    } else if (randomEvent.includes("Проверка налоговой")) {
      setMoney(prevMoney => prevMoney - 500)
    }

    setTimeout(() => {
      setEvent(null)
      if (randomEvent.includes("Экономический бум") || randomEvent.includes("Забастовка")) {
        setIncome(prevIncome => Math.floor(prevIncome / (randomEvent.includes("Экономический бум") ? 1.2 : 0.9)))
      }
    }, 5000)
  }

  const buyCrypto = () => {
    const amount = parseFloat(buyAmount)
    if (isNaN(amount) || amount <= 0) {
      setTransactionInfo("Введите корректное значение для покупки")
      return
    }

    const cost = amount * cryptoPrice
    if (cost > money) {
      setTransactionInfo(`Недостаточно средств. Нужно $${cost.toFixed(2)}`)
      return
    }

    setMoney(prevMoney => prevMoney - cost)
    setCryptoAmount(prevAmount => prevAmount + amount)
    setTransactionInfo(`Куплено ${amount} крипты за $${cost.toFixed(2)}`)
    setBuyAmount('')
  }

  const sellCrypto = () => {
    const amount = parseFloat(sellAmount)
    if (isNaN(amount) || amount <= 0) {
      setTransactionInfo("Введите корректное значение для продажи")
      return
    }

    if (amount > cryptoAmount) {
      setTransactionInfo(`У вас недостаточно крипты. У вас есть ${cryptoAmount}`)
      return
    }

    const earnings = amount * cryptoPrice
    setMoney(prevMoney => prevMoney + earnings)
    setCryptoAmount(prevAmount => prevAmount - amount)
    setTransactionInfo(`Продано ${amount} крипты за $${earnings.toFixed(2)}`)
    setSellAmount('')
  }

  const updateBusinessHealth = () => {
    setBusinessHealth(prev => {
      const newHealth = { ...prev }
      Object.keys(ownedBusinesses).forEach(businessName => {
        if (newHealth[businessName] > 0) {
          newHealth[businessName] -= Math.random() * 2 // Decrease health by 0-2% each day
        }
      })
      return newHealth
    })
  }

  const repairBusiness = (businessName: string) => {
    const repairCost = businesses.find(b => b.name === businessName)?.cost * 0.1 || 0
    if (money >= repairCost) {
      setMoney(prevMoney => prevMoney - repairCost)
      setBusinessHealth(prev => ({
        ...prev,
        [businessName]: 100
      }))
    }
  }

  const calculateTaxes = () => {
    const taxAmount = income * (taxRate / 100)
    setNextTaxPayment(taxAmount)
    if (day % nextTaxDay === 0) {
      if (money >= taxAmount) {
        setMoney(prevMoney => prevMoney - taxAmount)
        setTransactionInfo(`Уплачены налоги в размере $${taxAmount.toFixed(2)}`)
      } else {
        setIncome(prevIncome => prevIncome / 2)
        setTransactionInfo('Налоговая оштрафовала вас! Доход уменьшен вдвое.')
      }
      setNextTaxDay(day + 10)
    }
  }

  return (
    <div className="container mx-auto p-4 bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen text-white">
      <Card className="mb-4 bg-gray-800 text-white border-gray-700">
        <CardHeader className="bg-gray-700">
          <CardTitle className="text-2xl text-yellow-400">Бизнес-империя 7.0</CardTitle>
          <CardDescription className="text-gray-300">День {day}</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="flex items-center bg-gray-700 p-3 rounded-lg">
              <DollarSign className="mr-2 text-yellow-400" />
              <span className="font-bold">${money.toLocaleString()}</span>
            </div>
            <div className="flex items-center bg-gray-700 p-3 rounded-lg">
              <TrendingUp className="mr-2 text-yellow-400" />
              <span className="font-bold">${income.toLocaleString()}/день</span>
            </div>
            <div className="flex items-center bg-gray-700 p-3 rounded-lg">
              <Users className="mr-2 text-yellow-400" />
              <span className="font-bold">{employees} сотр.</span>
            </div>
            <div className="flex items-center bg-gray-700 p-3 rounded-lg">
              <Building className="mr-2 text-yellow-400" />
              <span className="font-bold">{buildings} зд.</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Button onClick={handleClick} size="lg" className="w-full h-20 text-xl bg-yellow-400 text-gray-900 hover:bg-yellow-500">
              Клик (${clickValue})
            </Button>
            <Button onClick={upgradeClick} size="lg" className="w-full h-20 text-xl bg-yellow-400 text-gray-900 hover:bg-yellow-500" disabled={money < clickUpgradeCost}>
              Улучшить клик (${clickUpgradeCost})
            </Button>
          </div>
        </CardContent>
      </Card>

      {event && (
        <Card className="mb-4 bg-red-900 border-red-700">
          <CardContent className="p-4 flex items-center">
            <AlertTriangle className="mr-2 text-red-500" />
            <span className="font-bold text-red-300">{event}</span>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="actions" className="mb-4">
        <TabsList className="grid w-full grid-cols-6 bg-gray-700">
          <TabsTrigger value="actions" className="text-gray-300 data-[state=active]:bg-yellow-400 data-[state=active]:text-gray-900">Действия</TabsTrigger>
          <TabsTrigger value="businesses" className="text-gray-300 data-[state=active]:bg-yellow-400 data-[state=active]:text-gray-900">Бизнесы</TabsTrigger>
          <TabsTrigger value="investments" className="text-gray-300 data-[state=active]:bg-yellow-400 data-[state=active]:text-gray-900">Инвестиции</TabsTrigger>
          <TabsTrigger value="assets" className="text-gray-300 data-[state=active]:bg-yellow-400 data-[state=active]:text-gray-900">Активы</TabsTrigger>
          <TabsTrigger value="bank" className="text-gray-300 data-[state=active]:bg-yellow-400 data-[state=active]:text-gray-900">Банк</TabsTrigger>
          <TabsTrigger value="stats" className="text-gray-300 data-[state=active]:bg-yellow-400 data-[state=active]:text-gray-900">Статистика</TabsTrigger>
        </TabsList>
        <TabsContent value="actions">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-yellow-400">Нанять сотрудника</CardTitle>
                <CardDescription className="text-gray-400">Стоимость: $100</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">Каждый сотрудник приносит $5 в день</p>
              </CardContent>
              <CardFooter>
                <Button onClick={hireEmployee} disabled={money < 100} className="w-full bg-yellow-400 text-gray-900 hover:bg-yellow-500">Нанять</Button>
              </CardFooter>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-yellow-400">Купить здание</CardTitle>
                <CardDescription className="text-gray-400">Стоимость: $500</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">Каждое здание приносит $50 в день</p>
              </CardContent>
              <CardFooter>
                <Button onClick={buyBuilding} disabled={money < 500} className="w-full bg-yellow-400 text-gray-900 hover:bg-yellow-500">Купить</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="businesses">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {businesses.map(business => (
              <Card key={business.name} className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center text-yellow-400">
                    {business.icon}
                    <span className="ml-2">{business.name}</span>
                  </CardTitle>
                  <CardDescription className="text-gray-400">Стоимость: ${business.cost.toLocaleString()}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">Доход: ${business.income}/день</p>
                  <p className="text-gray-300">Во владении: {ownedBusinesses[business.name] || 0}</p>
                  <p className="text-gray-300">Состояние: {businessHealth[business.name]?.toFixed(2) || 100}%</p>
                  <Progress value={businessHealth[business.name] || 100} className="mt-2" />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button onClick={() => buyBusiness(business)} disabled={money < business.cost} className="bg-yellow-400 text-gray-900 hover:bg-yellow-500">
                    Купить бизнес
                  </Button>
                  <Button onClick={() => repairBusiness(business.name)} disabled={money < business.cost * 0.1 || (businessHealth[business.name] || 100) === 100} className="bg-blue-500 hover:bg-blue-600">
                    Ремонт (${(business.cost * 0.1).toFixed(2)})
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="investments">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center text-yellow-400">
                <Bitcoin className="mr-2" />
                Криптовалюта
              </CardTitle>
              <CardDescription className="text-gray-400">Текущая цена: ${cryptoPrice.toFixed(2)}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-gray-300">У вас: {cryptoAmount.toFixed(4)} крипты</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input
                    type="number"
                    placeholder="Количество для покупки"
                    value={buyAmount}
                    onChange={(e) => setBuyAmount(e.target.value)}
                    className="mb-2 bg-gray-700 text-white border-gray-600"
                  />
                  <Button onClick={buyCrypto} className="w-full bg-yellow-400 text-gray-900 hover:bg-yellow-500">Купить</Button>
                </div>
                <div>
                  <Input
                    type="number"
                    placeholder="Количество для продажи"
                    value={sellAmount}
                    onChange={(e) => setSellAmount(e.target.value)}
                    className="mb-2 bg-gray-700 text-white border-gray-600"
                  />
                  <Button onClick={sellCrypto} className="w-full bg-yellow-400 text-gray-900 hover:bg-yellow-500">Продать</Button>
                </div>
              </div>
              {transactionInfo && (
                <p className="mt-4 text-sm text-yellow-400">{transactionInfo}</p>
              )}
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={cryptoHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="day" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none' }} />
                    <Line type="monotone" dataKey="price" stroke="#FFD700" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="assets">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assets.map(asset => (
              <Card key={asset.name} className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center text-yellow-400">
                    {asset.icon}
                    <span className="ml-2">{asset.name}</span>
                  </CardTitle>
                  <CardDescription className="text-gray-400">Стоимость: ${asset.cost.toLocaleString()}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">Во владении: {ownedAssets[asset.name] || 0}</p>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => buyAsset(asset)} disabled={money < asset.cost} className="w-full bg-yellow-400 text-gray-900 hover:bg-yellow-500">
                    Купить
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="bank">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-yellow-400">Банковский счет</CardTitle>
              <CardDescription className="text-gray-400">Баланс: ${bankBalance.toFixed(2)}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">Процентная ставка: 5% в день</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input
                    type="number"
                    id="depositAmount"
                    placeholder="Сумма для внесения"
                    className="mb-2 bg-gray-700 text-white border-gray-600"
                  />
                  <Button id="depositBtn" className="w-full bg-yellow-400 text-gray-900 hover:bg-yellow-500">Внести</Button>
                </div>
                <div>
                  <Input
                    type="number"
                    id="withdrawAmount"
                    placeholder="Сумма для снятия"
                    className="mb-2 bg-gray-700 text-white border-gray-600"
                  />
                  <Button id="withdrawBtn" className="w-full bg-yellow-400 text-gray-900 hover:bg-yellow-500">Снять</Button>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="mt-4 bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-yellow-400">Налоги</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">Текущая налоговая ставка: {taxRate}%</p>
              <p className="text-gray-300">Следующий налоговый платеж: ${nextTaxPayment.toFixed(2)}</p>
              <p className="text-gray-300">День следующего налогового платежа: {nextTaxDay}</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="stats">
          <div className="empire-stats bg-gray-800 border-gray-700">
            <div className="stats-header">
              <h1 className="text-yellow-400">Статистика империи</h1>
            </div>
            
            <div className="stat-item bg-gray-700">
              <span className="stat-label text-gray-400">Всего заработано:</span>
              <span className="stat-value text-yellow-400">${(money + bankBalance + Object.values(ownedAssets).reduce((sum, count) => sum + count, 0) * 1000000).toFixed(2)}</span>
            </div>

            <div className="stat-item bg-gray-700">
              <span className="stat-label text-gray-400">Средний доход в день:</span>
              <span className="stat-value text-yellow-400">${(income / day).toFixed(2)}</span>
            </div>

            <div className="stat-item bg-gray-700">
              <span className="stat-label text-gray-400">Количество бизнесов:</span>
              <span className="stat-value text-yellow-400">{Object.values(ownedBusinesses).reduce((a, b) => a + b, 0)}</span>
            </div>

            <div className="stat-item bg-gray-700">
              <span className="stat-label text-gray-400">Стоимость клика:</span>
              <span className="stat-value text-yellow-400">${clickValue.toFixed(2)}</span>
            </div>

            <div className="stat-item bg-gray-700">
              <span className="stat-label text-gray-400">Криптовалюты:</span>
              <span className="stat-value text-yellow-400">₿ {cryptoAmount.toFixed(4)} BTC</span>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Card className="mt-4 bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-yellow-400">Прогресс к победе</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={(money / 1000000000) * 100} className="w-full h-4" />
        </CardContent>
        <CardFooter>
          <p className="text-center w-full text-gray-300">Цель: накопить $1,000,000,000 (Текущий прогресс: {((money / 1000000000) * 100).toFixed(2)}%)</p>
        </CardFooter>
      </Card>
    </div>
  )
}
