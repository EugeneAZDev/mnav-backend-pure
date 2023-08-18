({
  method: async ({ clientId }) => {
    try {
      const result = await crud('User').select({ id: clientId, fields: ['id', 'premiumAt', 'premiumPeriod'] })
      if (result.rows.length === 1) {
        const [user] = result.rows;
        const dateNow = new Date().toISOString().split('T')[0]
        const initialStatus = {
          expiresAt: null,
          premium: false,
          lifetime: false
        }
        const SUBSCRIPTION_TYPE = {
          none: () => initialStatus,
          month: () => {            
            const datetime = user.premiumAt
            if (!datetime) return initialStatus
            datetime.setMonth(datetime.getMonth() + 1)
            const date = datetime.toISOString().split('T')[0]
            return {              
              expiresAt: date,
              premium: dateNow > date ? false : true,
              lifetime: false
            }
          },
          year: () => {
            const datetime = user.premiumAt
            if (!datetime) return initialStatus
            datetime.setFullYear(datetime.getFullYear() + 1)            
            const date = datetime.toISOString().split('T')[0]
            return {              
              expiresAt: date,
              premium: dateNow > date ? false : true,
              lifetime: false
            }
          },
          lifetime: () => ({
            expiresAt: null,
            premium: true,
            lifetime: true
          }),
        }
        const status = SUBSCRIPTION_TYPE[user.premiumPeriod]()
        return responseType.modifiedBodyTemplate(responseType.success, {
          status
        });
      }
      return responseType.modifiedBodyTemplate(responseType.success, {
        status: undefined
      });
    } catch (error) {
      return { ...responseType.error(), error };
    }
  }
});
