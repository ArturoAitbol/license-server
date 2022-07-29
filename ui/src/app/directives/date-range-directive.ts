import { Directive, Inject, Injectable, Input} from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import { DateRange, MatDateRangeSelectionStrategy, MAT_DATE_RANGE_SELECTION_STRATEGY } from '@angular/material/datepicker';


@Injectable()
export class RangeSelectionStrategy<D> implements MatDateRangeSelectionStrategy<D> {

  public max: Date;
  public min: Date;
  public month: boolean;

  constructor(private _dateAdapter: DateAdapter<D>) {}

  selectionFinished(date: D | null): DateRange<D> {
    return this._createWeekRange(date);
  }

  createPreview(activeDate: D | null): DateRange<D> {
    return this._createWeekRange(activeDate);
  }

  private _createWeekRange(date: D | null): DateRange<D> {
    if (date) {
      const dayofWeek = this._dateAdapter.getDayOfWeek(date)
      let start, end;
      
      if(this.month){
        start = this._dateAdapter.addCalendarDays(date,-(this._dateAdapter.getDate(date)-1));
        end = this._dateAdapter.addCalendarMonths(start,1);
        end = this._dateAdapter.addCalendarDays(end,-1);
      }else{
        start= this._dateAdapter.addCalendarDays(date, -dayofWeek);
        end= this._dateAdapter.addCalendarDays(start, 6);
      }
     
      const startLicense = this._dateAdapter.createDate(this.min.getFullYear(),this.min.getMonth(),this.min.getDate());
      const endLicense = this._dateAdapter.createDate(this.max.getFullYear(),this.max.getMonth(),this.max.getDate());
      
      if(this._dateAdapter.compareDate(start,startLicense)<0)
        start = startLicense;
      if(this._dateAdapter.compareDate(end,endLicense)>0)
        end = endLicense;
      
        return new DateRange<D>(start, end);
    }
    return new DateRange<D>(null, null);
  }
}

@Directive({
  selector: '[lcDateRange]',
  providers: [
    {
      provide: MAT_DATE_RANGE_SELECTION_STRATEGY,
      useClass: RangeSelectionStrategy
    }
  ]
})
export class DateRangeDirective{

  @Input() set maxDate(value: Date) {
      this.rangeSelectionStrategy.max = value;
    }
  @Input() set minDate(value: Date) {
      this.rangeSelectionStrategy.min = value;
  }
  @Input() set month(value: boolean) {
    this.rangeSelectionStrategy.month = value;
  }
    
  constructor( @Inject(MAT_DATE_RANGE_SELECTION_STRATEGY)
  private rangeSelectionStrategy: RangeSelectionStrategy<any>) {}

}
