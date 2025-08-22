import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-toastify";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, getDay, startOfWeek, endOfWeek } from "date-fns";
import subscriptionService from "@/services/api/subscriptionService";
import ApperIcon from "@/components/ApperIcon";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Empty from "@/components/ui/Empty";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";

const BillingCalendarPage = () => {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [monthlyPayments, setMonthlyPayments] = useState([]);
  const [monthlyTotal, setMonthlyTotal] = useState(0);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const activeSubscriptions = await subscriptionService.getActiveSubscriptions();
      setSubscriptions(activeSubscriptions);
      calculateMonthlyPayments(activeSubscriptions, currentDate);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateMonthlyPayments = (subs, date) => {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    
    const payments = [];
    let total = 0;

    subs.forEach(sub => {
      const nextPayment = new Date(sub.nextPaymentDate);
      
      // Check if payment falls in current month
      if (nextPayment >= monthStart && nextPayment <= monthEnd) {
        payments.push({
          ...sub,
          paymentDate: nextPayment
        });
        total += sub.amount;
      }
      
      // For monthly subscriptions, add recurring payments within the month
      if (sub.billingCycle === 'monthly') {
        const recurringDate = new Date(nextPayment);
        while (recurringDate <= monthEnd) {
          if (recurringDate >= monthStart && !payments.find(p => p.Id === sub.Id && isSameDay(p.paymentDate, recurringDate))) {
            payments.push({
              ...sub,
              paymentDate: new Date(recurringDate)
            });
            total += sub.amount;
          }
          recurringDate.setMonth(recurringDate.getMonth() + 1);
        }
      }
      
      // For weekly subscriptions
      if (sub.billingCycle === 'weekly') {
        const recurringDate = new Date(nextPayment);
        while (recurringDate <= monthEnd) {
          if (recurringDate >= monthStart) {
            const existingPayment = payments.find(p => p.Id === sub.Id && isSameDay(p.paymentDate, recurringDate));
            if (!existingPayment) {
              payments.push({
                ...sub,
                paymentDate: new Date(recurringDate)
              });
              total += sub.amount;
            }
          }
          recurringDate.setDate(recurringDate.getDate() + 7);
        }
      }
    });

    setMonthlyPayments(payments);
    setMonthlyTotal(total);
  };

  useEffect(() => {
    loadData();
  }, [currentDate]);

  const handlePreviousMonth = () => {
    const newDate = subMonths(currentDate, 1);
    setCurrentDate(newDate);
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    const newDate = addMonths(currentDate, 1);
    setCurrentDate(newDate);
    setSelectedDate(null);
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const getPaymentsForDate = (date) => {
    return monthlyPayments.filter(payment => 
      isSameDay(new Date(payment.paymentDate), date)
    );
  };

  const formatAmount = (amount, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency
    }).format(amount);
  };

  const getDaysInMonth = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    
    return eachDayOfInterval({
      start: calendarStart,
      end: calendarEnd
    });
  };

  const PaymentDetails = ({ payments }) => (
    <AnimatePresence>
      {selectedDate && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedDate(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-display font-semibold text-gray-900">
                  {format(selectedDate, "MMMM dd, yyyy")}
                </h3>
                <p className="text-gray-600 text-sm">
                  {payments.length} payment{payments.length !== 1 ? 's' : ''} scheduled
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedDate(null)}
                className="p-2"
              >
                <ApperIcon name="X" size={16} />
              </Button>
            </div>
            
            {payments.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ApperIcon name="Calendar" size={32} className="text-gray-400" />
                </div>
                <p className="text-gray-600">No payments scheduled for this date</p>
              </div>
            ) : (
              <div className="space-y-3">
                {payments.map((payment, index) => (
                  <motion.div
                    key={`${payment.Id}-${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card padding="default" className="border-l-4 border-l-primary">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                            <ApperIcon name={payment.serviceIcon} size={20} className="text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 text-sm">
                              {payment.serviceName}
                            </h4>
                            <p className="text-xs text-gray-500">
                              {payment.description}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {formatAmount(payment.amount, payment.currency)}
                          </p>
                          <Badge variant="info" size="xs">
                            {payment.billingCycle}
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
                
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">Total for this date:</span>
                    <span className="font-bold text-lg text-primary">
                      {formatAmount(payments.reduce((sum, p) => sum + p.amount, 0))}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (loading) {
    return <Loading type="calendar" />;
  }

  if (error) {
    return (
      <Error 
        message={error}
        onRetry={loadData}
        title="Failed to load billing calendar"
      />
    );
  }

  const days = getDaysInMonth();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-4 pt-12 pb-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/more')}
              className="p-2"
            >
              <ApperIcon name="ArrowLeft" size={20} />
            </Button>
            
            <div>
              <h1 className="text-2xl font-display font-bold text-gray-900">
                Billing Calendar
              </h1>
              <p className="text-gray-600 mt-1">
                Monthly view of subscription payments
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Monthly Overview */}
      <div className="px-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card variant="gradient" padding="lg" className="text-white">
            <div className="text-center">
              <p className="text-3xl font-display font-bold mb-2">
                {formatAmount(monthlyTotal)}
              </p>
              <p className="text-white/80 text-sm">
                Total for {format(currentDate, "MMMM yyyy")}
              </p>
              <p className="text-white/60 text-xs mt-1">
                {monthlyPayments.length} payment{monthlyPayments.length !== 1 ? 's' : ''} scheduled
              </p>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Calendar Navigation */}
      <div className="px-4 mb-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePreviousMonth}
            className="p-2"
          >
            <ApperIcon name="ChevronLeft" size={20} />
          </Button>
          
          <h2 className="text-xl font-display font-semibold text-gray-900">
            {format(currentDate, "MMMM yyyy")}
          </h2>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNextMonth}
            className="p-2"
          >
            <ApperIcon name="ChevronRight" size={20} />
          </Button>
        </motion.div>
      </div>

      {/* Calendar Grid */}
      <div className="px-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card padding="default">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center py-2">
                  <span className="text-sm font-medium text-gray-600">{day}</span>
                </div>
              ))}
            </div>
            
            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => {
                const dayPayments = getPaymentsForDate(day);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const hasPayments = dayPayments.length > 0;
                const dayTotal = dayPayments.reduce((sum, p) => sum + p.amount, 0);
                
                return (
                  <motion.button
                    key={day.toString()}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.01 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDateClick(day)}
                    className={`
                      aspect-square p-2 rounded-lg text-sm font-medium transition-all duration-200 relative
                      ${isCurrentMonth 
                        ? hasPayments 
                          ? 'bg-primary text-white hover:bg-primary/80' 
                          : 'text-gray-900 hover:bg-gray-100'
                        : 'text-gray-300 hover:bg-gray-50'
                      }
                      ${isSameDay(day, new Date()) && isCurrentMonth ? 'ring-2 ring-secondary' : ''}
                    `}
                  >
                    <span className="block">{format(day, 'd')}</span>
                    {hasPayments && (
                      <>
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                          <div className="w-1 h-1 bg-white rounded-full" />
                        </div>
                        <div className="absolute -top-1 -right-1">
                          <Badge variant="warning" size="xs" className="text-xs px-1 py-0">
                            {dayPayments.length}
                          </Badge>
                        </div>
                      </>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 gap-4"
        >
          <Button
            variant="ghost"
            className="flex items-center justify-center space-x-2 py-4"
            onClick={() => navigate('/subscriptions')}
          >
            <ApperIcon name="CreditCard" size={20} />
            <span>Manage Subscriptions</span>
          </Button>
          
          <Button
            variant="ghost"
            className="flex items-center justify-center space-x-2 py-4"
            onClick={() => {
              const today = new Date();
              const todayPayments = getPaymentsForDate(today);
              setSelectedDate(today);
            }}
          >
            <ApperIcon name="Clock" size={20} />
            <span>Today's Payments</span>
          </Button>
        </motion.div>
      </div>

      {/* Payment Details Modal */}
      {selectedDate && (
        <PaymentDetails payments={getPaymentsForDate(selectedDate)} />
      )}
    </div>
  );
};

export default BillingCalendarPage;