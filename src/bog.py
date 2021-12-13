def confirm_transaction(address):
    deposited_tx = API.checkDeposit(address)
    last_validated_tx = get_validated_tx_from_db
    db_unaccounted_amount = f"SELECT UNACCOUTNED_AMOUNT WHERE ADDRESS={address}"
    deposit_complete = False

    if deposited_tx:
        if last_validated_tx:
          for i in range(len(deposited_tx)):
              if deposited_tx[i].amount == "32000000000000000000" and deposited_tx[i] != last_validated_tx and deposited_tx[i].to == FAUCET_ADDRESS:
                weeklyCount += 33   #update in db
                dailyCount += 33    #update in db
                # handle daily and weekly time in db
                last_validated_tx =  deposited_tx[i]  # update_last_validated_transaction_in_db
                return
              elif (int(deposited_tx[i].amount)) < 32000000000000000000 and deposited_tx[i].to == FAUCET_ADDRESS:
                db_unaccounted_amount += int(deposited_tx[i].amount)
                 # update unaccountedAmount and unaccountedTx in database
                f"UPDATE SET unaccoutned_amount where address={address}"
                f"UPDATE SET unaccoutned_tx where address={address}"
                return
        else:
          for i in range(len(deposited_tx)):
            if deposited_tx[i].amount == "32000000000000000000" and deposited_tx[i] != last_validated_tx and deposited_tx[i].to == FAUCET_ADDRESS:
                last_validated_tx = deposited_tx[i] # update_last_validated_transaction_in_db
                weeklyCount += 33   #update in db
                dailyCount += 33    #update in db
                # handle daily and weekly time in db
                return
            elif (int(deposited_tx[i].amount)) < 32000000000000000000 and deposited_tx[i].to == FAUCET_ADDRESS:
                db_unaccounted_amount += int(deposited_tx[i].amount)
                 # update unaccountedAmount and unaccountedTx in database
                f"UPDATE SET unaccoutned_amount where address={address}"
                f"UPDATE SET unaccoutned_tx where address={address}"
                return
        if db_unaccounted_amount >= 32000000000000000000:
          db_unaccounted_amount -= 32000000000000000000
          weeklyCount += 33   #update in db
          dailyCount += 33    #update in db
          # handle daily and weekly time in db
          last_validated_tx = unvalidated_tx   # update_last_validated_transaction_in_db
          
    else:
      return False